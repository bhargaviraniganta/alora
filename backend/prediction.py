"""
prediction.py — Alora v5
Lazy-loads models on first prediction call so the server starts
even if model files are being uploaded.
"""

import os, numpy as np, joblib
from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem, Descriptors, MACCSkeys, rdMolDescriptors
RDLogger.DisableLog('rdApp.*')

MORGAN_BITS = 512
MACCS_BITS  = 167
N_DESC      = 12
MODELS_DIR  = os.environ.get("MODELS_DIR", "./models")

_artifacts = None   # loaded on first call, not at import

# ── Artifact loading ──────────────────────────────────────────────────────────

def _load():
    global _artifacts
    if _artifacts is not None:
        return _artifacts

    required = [
        "scaler.pkl", "le_chem.pkl", "le_final.pkl",
        "chemical_model5.pkl", "final_model5.pkl",
        "chemical_threshold5.pkl", "final_threshold5.pkl",
        "chemical_selector5.pkl", "final_selector5.pkl",
        "excipient_type_map5.pkl", "reason_lookup5.pkl",
        "physical_rule.pkl", "physical_reason_rule.pkl", "chemical_reason_rule.pkl",
    ]
    missing = [f for f in required if not os.path.exists(f"{MODELS_DIR}/{f}")]
    if missing:
        raise FileNotFoundError(
            f"Model files not found in {MODELS_DIR}: {missing}. "
            "Upload the .pkl files trained by drug_excipient_v5.ipynb."
        )

    _artifacts = {
        "scaler":      joblib.load(f"{MODELS_DIR}/scaler.pkl"),
        "le_chem":     joblib.load(f"{MODELS_DIR}/le_chem.pkl"),
        "le_final":    joblib.load(f"{MODELS_DIR}/le_final.pkl"),
        "m_chem":      joblib.load(f"{MODELS_DIR}/chemical_model5.pkl"),
        "m_final":     joblib.load(f"{MODELS_DIR}/final_model5.pkl"),
        "thr_chem":    joblib.load(f"{MODELS_DIR}/chemical_threshold5.pkl"),
        "thr_final":   joblib.load(f"{MODELS_DIR}/final_threshold5.pkl"),
        "sel_chem":    joblib.load(f"{MODELS_DIR}/chemical_selector5.pkl"),
        "sel_final":   joblib.load(f"{MODELS_DIR}/final_selector5.pkl"),
        "exc_map":     joblib.load(f"{MODELS_DIR}/excipient_type_map5.pkl"),
        "reason_map":  joblib.load(f"{MODELS_DIR}/reason_lookup5.pkl"),
        "phys_rule":   joblib.load(f"{MODELS_DIR}/physical_rule.pkl"),
        "phys_r_rule": joblib.load(f"{MODELS_DIR}/physical_reason_rule.pkl"),
        "chem_r_rule": joblib.load(f"{MODELS_DIR}/chemical_reason_rule.pkl"),
    }
    return _artifacts

# ── Feature extraction ────────────────────────────────────────────────────────

def _get_mol_features(smiles):
    mol = Chem.MolFromSmiles(str(smiles))
    if mol is None:
        return None
    try:
        max_charge = Descriptors.MaxPartialCharge(mol)
    except Exception:
        max_charge = 0.0

    desc = np.array([
        Descriptors.MolWt(mol), Descriptors.MolLogP(mol),
        Descriptors.NumHDonors(mol), Descriptors.NumHAcceptors(mol),
        Descriptors.TPSA(mol), Descriptors.NumRotatableBonds(mol),
        Descriptors.RingCount(mol), Descriptors.NumAromaticRings(mol),
        Descriptors.FractionCSP3(mol), Descriptors.HeavyAtomCount(mol),
        rdMolDescriptors.CalcNumHeteroatoms(mol),
        max_charge if np.isfinite(max_charge) else 0.0,
    ], dtype=np.float32)
    desc = np.where(np.isfinite(desc), desc, 0.0).astype(np.float32)

    morgan = np.zeros(MORGAN_BITS, dtype=np.float32)
    AllChem.DataStructs.ConvertToNumpyArray(
        AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=MORGAN_BITS), morgan)

    maccs = np.zeros(MACCS_BITS, dtype=np.float32)
    AllChem.DataStructs.ConvertToNumpyArray(MACCSkeys.GenMACCSKeys(mol), maccs)

    return np.concatenate([desc, morgan, maccs])


def _cosine_sim(a, b):
    return float(np.dot(a, b) / ((np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8))


def _make_pair_features(drug_smi, exc_smi):
    d = _get_mol_features(drug_smi)
    e = _get_mol_features(exc_smi)
    if d is None or e is None:
        return None
    d_d, e_d = d[:N_DESC], e[:N_DESC]
    return np.concatenate([
        d, e,
        np.abs(d_d - e_d),
        d_d * e_d,
        np.log((d_d + 1) / (e_d + 1)),
        np.array([_cosine_sim(d, e)], dtype=np.float32),
    ])

# ── Public function ───────────────────────────────────────────────────────────

def predict_compatibility(drug_name, drug_smiles, excipient_name, excipient_smiles):
    a = _load()   # raises FileNotFoundError if pkls missing → clean 503

    feat = _make_pair_features(drug_smiles, excipient_smiles)
    if feat is None:
        raise ValueError("Invalid SMILES string for drug or excipient.")

    X = a["scaler"].transform(feat.reshape(1, -1))

    # Final
    X_fin      = a["sel_final"].transform(X)
    prob_fin   = a["m_final"].predict_proba(X_fin)[0]
    incomp_idx = list(a["le_final"].classes_).index("incompatible")
    idx_fin    = incomp_idx if prob_fin[incomp_idx] >= a["thr_final"] else (1 - incomp_idx)
    final_pred = a["le_final"].inverse_transform([idx_fin])[0]
    confidence = float(prob_fin[idx_fin])

    # Chemical
    X_ch         = a["sel_chem"].transform(X)
    prob_ch      = a["m_chem"].predict_proba(X_ch)[0]
    unstable_idx = list(a["le_chem"].classes_).index("unstable")
    idx_ch       = unstable_idx if prob_ch[unstable_idx] >= a["thr_chem"] else (1 - unstable_idx)
    chem_pred    = a["le_chem"].inverse_transform([idx_ch])[0]

    # Physical (rule-based)
    phys_pred = a["phys_rule"][final_pred]

    # Reasoning
    key   = (drug_name.lower().strip(), excipient_name.lower().strip())
    entry = a["reason_map"].get(key, {})

    phys_reason = (
        entry["physical_reason"]
        if entry and entry.get("physical_label") == phys_pred and entry.get("physical_reason")
        else a["phys_r_rule"][final_pred]
    )
    chem_reason = entry.get("chemical_reason") or a["chem_r_rule"][chem_pred]
    exc_type    = a["exc_map"].get(excipient_name.lower().strip(), "Unknown")

    return {
        "physical_compatibility": phys_pred,
        "physical_reasoning":     phys_reason,
        "chemical_compatibility": chem_pred,
        "chemical_reasoning":     chem_reason,
        "excipient_type":         exc_type,
        "final_label":            final_pred,
        "confidence":             round(confidence, 4),
    }
