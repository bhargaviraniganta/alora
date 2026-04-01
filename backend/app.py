"""
Alora v5 — Drug–Excipient Compatibility Backend
Deploy this on HuggingFace Spaces (SDK: Docker or Gradio → FastAPI)

Requirements (requirements.txt):
    fastapi
    uvicorn
    rdkit
    scikit-learn
    xgboost
    lightgbm
    imbalanced-learn
    joblib
    numpy
    pandas
    openpyxl
"""

import os
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem, Descriptors, MACCSkeys, rdMolDescriptors
RDLogger.DisableLog('rdApp.*')

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Alora Drug–Excipient API", version="5.0")

frontend_origin = os.environ.get("FRONTEND_ORIGIN")
allowed_origins = [
    "https://drug-excipient-compat.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
if frontend_origin:
    allowed_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Model loading (done once at startup) ────────────────────────────────────

MODELS_DIR = os.environ.get("MODELS_DIR", "./models")

def load_artifacts():
    return {
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

artifacts = load_artifacts()

# ── Feature extraction (mirrors v5 notebook exactly) ────────────────────────

MORGAN_BITS = 512
MACCS_BITS  = 167
N_DESC      = 12

def get_mol_features(smiles: str):
    mol = Chem.MolFromSmiles(str(smiles))
    if mol is None:
        return None

    try:
        max_charge = Descriptors.MaxPartialCharge(mol)
    except Exception:
        max_charge = 0.0

    desc = np.array([
        Descriptors.MolWt(mol),
        Descriptors.MolLogP(mol),
        Descriptors.NumHDonors(mol),
        Descriptors.NumHAcceptors(mol),
        Descriptors.TPSA(mol),
        Descriptors.NumRotatableBonds(mol),
        Descriptors.RingCount(mol),
        Descriptors.NumAromaticRings(mol),
        Descriptors.FractionCSP3(mol),
        Descriptors.HeavyAtomCount(mol),
        rdMolDescriptors.CalcNumHeteroatoms(mol),
        max_charge if np.isfinite(max_charge) else 0.0,
    ], dtype=np.float32)
    desc = np.where(np.isfinite(desc), desc, 0.0).astype(np.float32)

    morgan = np.zeros(MORGAN_BITS, dtype=np.float32)
    AllChem.DataStructs.ConvertToNumpyArray(
        AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=MORGAN_BITS), morgan)

    maccs = np.zeros(MACCS_BITS, dtype=np.float32)
    AllChem.DataStructs.ConvertToNumpyArray(
        MACCSkeys.GenMACCSKeys(mol), maccs)

    return np.concatenate([desc, morgan, maccs])


def cosine_sim(a, b):
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8
    return float(np.dot(a, b) / denom)


def make_pair_features(drug_smi: str, exc_smi: str):
    d = get_mol_features(drug_smi)
    e = get_mol_features(exc_smi)
    if d is None or e is None:
        return None

    d_desc, e_desc = d[:N_DESC], e[:N_DESC]
    abs_diff  = np.abs(d_desc - e_desc)
    product   = d_desc * e_desc
    log_ratio = np.log((d_desc + 1) / (e_desc + 1))
    fp_cos    = np.array([cosine_sim(d, e)], dtype=np.float32)

    return np.concatenate([d, e, abs_diff, product, log_ratio, fp_cos])

# ── Prediction logic ─────────────────────────────────────────────────────────

def predict_compatibility(drug_name, drug_smiles, excipient_name, excipient_smiles):
    a = artifacts  # shorthand

    feat = make_pair_features(drug_smiles, excipient_smiles)
    if feat is None:
        raise ValueError("Invalid SMILES string for drug or excipient.")

    X = a["scaler"].transform(feat.reshape(1, -1))

    # Final label (binary with threshold)
    X_final   = a["sel_final"].transform(X)
    prob_fin  = a["m_final"].predict_proba(X_final)[0]
    incomp_idx = list(a["le_final"].classes_).index("incompatible")
    idx_final  = incomp_idx if prob_fin[incomp_idx] >= a["thr_final"] else (1 - incomp_idx)
    final_pred = a["le_final"].inverse_transform([idx_final])[0]
    confidence = float(prob_fin[idx_final])

    # Chemical (binary with threshold)
    X_chem   = a["sel_chem"].transform(X)
    prob_ch  = a["m_chem"].predict_proba(X_chem)[0]
    unstable_idx = list(a["le_chem"].classes_).index("unstable")
    idx_chem = unstable_idx if prob_ch[unstable_idx] >= a["thr_chem"] else (1 - unstable_idx)
    chem_pred = a["le_chem"].inverse_transform([idx_chem])[0]

    # Physical — rule-based
    phys_pred = a["phys_rule"][final_pred]

    # Reasoning lookup
    key   = (drug_name.lower().strip(), excipient_name.lower().strip())
    entry = a["reason_map"].get(key, {})

    if entry and entry.get("physical_label") == phys_pred and entry.get("physical_reason"):
        phys_reason = entry["physical_reason"]
    else:
        phys_reason = a["phys_r_rule"][final_pred]

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

# ── API endpoints ─────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    drug_name:        str
    drug_smiles:      str
    excipient_name:   str
    excipient_smiles: str

class PredictResponse(BaseModel):
    physical_compatibility: str
    physical_reasoning:     str
    chemical_compatibility: str
    chemical_reasoning:     str
    excipient_type:         str
    final_label:            str
    confidence:             float

@app.get("/")
def root():
    return {"status": "ok", "model": "Alora v5", "endpoint": "POST /predict"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        result = predict_compatibility(
            drug_name        = req.drug_name,
            drug_smiles      = req.drug_smiles,
            excipient_name   = req.excipient_name,
            excipient_smiles = req.excipient_smiles,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# ── Local dev entry point ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
