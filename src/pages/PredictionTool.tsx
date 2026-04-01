// PredictionTool.tsx  — Alora v5
// • ComboBox for all 4 inputs (dropdown + free text)
// • Drug SMILES dropdown auto-populated when drug name is selected/typed
// • Excipient SMILES dropdown auto-populated when excipient is selected/typed
// • Form + result persisted across navigation via predictionStore

import { useState, useMemo, useEffect } from 'react';
import {
  predictCompatibility,
  formatFinalLabel,
  finalLabelColor,
  stabilityColor,
  type PredictionResult,
} from '@/services/predictionService';
import { updateAnalytics } from '@/services/analyticsService';
import { predictionStore } from '@/services/predictionStore';
import { DATABASE_ENTRIES } from '@/data/databaseEntries';
import ComboBox from '@/components/ComboBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FlaskConical, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// ── Lookup maps derived from DATABASE_ENTRIES ────────────────────────────────

const ALL_DRUG_NAMES: string[] = [...new Set(DATABASE_ENTRIES.map(r => r.drug))].sort();
const ALL_EXCIPIENT_NAMES: string[] = [...new Set(DATABASE_ENTRIES.map(r => r.excipient))].sort();

const DRUG_SMILES_MAP: Record<string, string[]> = {};
for (const r of DATABASE_ENTRIES) {
  const smiles = Array.isArray(r.drugSmiles) ? r.drugSmiles : [r.drugSmiles];
  if (!DRUG_SMILES_MAP[r.drug]) DRUG_SMILES_MAP[r.drug] = [];
  for (const s of smiles)
    if (!DRUG_SMILES_MAP[r.drug].includes(s)) DRUG_SMILES_MAP[r.drug].push(s);
}
for (const k in DRUG_SMILES_MAP) DRUG_SMILES_MAP[k].sort();

const EXC_SMILES_MAP: Record<string, string[]> = {};
for (const r of DATABASE_ENTRIES) {
  const smiles = Array.isArray(r.excipientSmiles) ? r.excipientSmiles : [r.excipientSmiles];
  if (!EXC_SMILES_MAP[r.excipient]) EXC_SMILES_MAP[r.excipient] = [];
  for (const s of smiles)
    if (!EXC_SMILES_MAP[r.excipient].includes(s)) EXC_SMILES_MAP[r.excipient].push(s);
}
for (const k in EXC_SMILES_MAP) EXC_SMILES_MAP[k].sort();

const ALL_DRUG_SMILES: string[] = [...new Set(
  DATABASE_ENTRIES.flatMap(r => Array.isArray(r.drugSmiles) ? r.drugSmiles : [r.drugSmiles])
)].sort();

const ALL_EXC_SMILES: string[] = [...new Set(
  DATABASE_ENTRIES.flatMap(r => Array.isArray(r.excipientSmiles) ? r.excipientSmiles : [r.excipientSmiles])
)].sort();

// ── Component ────────────────────────────────────────────────────────────────

export default function PredictionTool() {
  const [form, setFormState] = useState(() => predictionStore.getForm());
  const [result, setResultState] = useState<PredictionResult | null>(() => predictionStore.getResult());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setForm = (f: typeof form) => { setFormState(f); predictionStore.setForm(f); };
  const setResult = (r: PredictionResult | null) => { setResultState(r); predictionStore.setResult(r); };

  // SMILES suggestions for drug
  const drugSmilesSuggestions = useMemo(() => {
    const exact = DRUG_SMILES_MAP[form.drug_name];
    if (exact?.length) return exact;
    const q = form.drug_name.toLowerCase();
    if (!q) return ALL_DRUG_SMILES;
    const hits = Object.entries(DRUG_SMILES_MAP)
      .filter(([n]) => n.toLowerCase().includes(q))
      .flatMap(([, s]) => s);
    return hits.length ? [...new Set(hits)].sort() : ALL_DRUG_SMILES;
  }, [form.drug_name]);

  // SMILES suggestions for excipient
  const excSmilesSuggestions = useMemo(() => {
    const exact = EXC_SMILES_MAP[form.excipient_name];
    if (exact?.length) return exact;
    const q = form.excipient_name.toLowerCase();
    if (!q) return ALL_EXC_SMILES;
    const hits = Object.entries(EXC_SMILES_MAP)
      .filter(([n]) => n.toLowerCase().includes(q))
      .flatMap(([, s]) => s);
    return hits.length ? [...new Set(hits)].sort() : ALL_EXC_SMILES;
  }, [form.excipient_name]);

  // Auto-fill SMILES when drug name resolves to exactly one
  useEffect(() => {
    const s = DRUG_SMILES_MAP[form.drug_name];
    if (s?.length === 1 && form.drug_smiles !== s[0])
      setForm({ ...form, drug_smiles: s[0] });
  }, [form.drug_name]); // eslint-disable-line

  // Auto-fill SMILES when excipient name resolves to exactly one
  useEffect(() => {
    const s = EXC_SMILES_MAP[form.excipient_name];
    if (s?.length === 1 && form.excipient_smiles !== s[0])
      setForm({ ...form, excipient_smiles: s[0] });
  }, [form.excipient_name]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.drug_name || !form.drug_smiles || !form.excipient_name || !form.excipient_smiles) {
      setError('All four fields are required.'); return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const prediction = await predictCompatibility(form);
      setResult(prediction);

      try {
        await updateAnalytics(prediction);
      } catch (analyticsError) {
        console.error('Analytics update failed', analyticsError);
      }
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Check the backend is running.');
    } finally { setLoading(false); }
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FlaskConical className="text-primary" size={32} />
            Compatibility Predictor
          </h1>
          <p className="text-slate-500 mt-2">
            Select or type a drug and excipient. SMILES codes auto-suggest from the database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* INPUT */}
          <Card className="shadow-md border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-700">Input Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <ComboBox
                  id="drug_name"
                  label="Drug Name"
                  value={form.drug_name}
                  onChange={val => setForm({ ...form, drug_name: val })}
                  options={ALL_DRUG_NAMES}
                  placeholder="e.g. Indapamide"
                  hint="Select from dropdown or type a new drug name"
                />

                <ComboBox
                  id="drug_smiles"
                  label="Drug SMILES Code"
                  value={form.drug_smiles}
                  onChange={val => setForm({ ...form, drug_smiles: val })}
                  options={drugSmilesSuggestions}
                  placeholder="Auto-filled when drug name is selected"
                  hint={
                    form.drug_name && DRUG_SMILES_MAP[form.drug_name]
                      ? `${DRUG_SMILES_MAP[form.drug_name].length} SMILES available for "${form.drug_name}"`
                      : 'SMILES notation for the active pharmaceutical ingredient'
                  }
                  mono
                />

                <div className="border-t border-slate-100" />

                <ComboBox
                  id="excipient_name"
                  label="Excipient Name"
                  value={form.excipient_name}
                  onChange={val => setForm({ ...form, excipient_name: val })}
                  options={ALL_EXCIPIENT_NAMES}
                  placeholder="e.g. Lactose Monohydrate"
                  hint="Select from dropdown or type a new excipient name"
                />

                <ComboBox
                  id="excipient_smiles"
                  label="Excipient SMILES Code"
                  value={form.excipient_smiles}
                  onChange={val => setForm({ ...form, excipient_smiles: val })}
                  options={excSmilesSuggestions}
                  placeholder="Auto-filled when excipient name is selected"
                  hint={
                    form.excipient_name && EXC_SMILES_MAP[form.excipient_name]
                      ? `${EXC_SMILES_MAP[form.excipient_name].length} SMILES available for "${form.excipient_name}"`
                      : 'SMILES notation for the excipient molecule'
                  }
                  mono
                />

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5">
                    {loading
                      ? <><Loader2 size={16} className="animate-spin mr-2" />Predicting…</>
                      : 'Predict Compatibility'}
                  </Button>
                  <Button type="button" variant="outline"
                    onClick={() => {
                      predictionStore.reset();
                      setFormState(predictionStore.getForm());
                      setResultState(null);
                      setError(null);
                    }}
                    className="px-4 border-slate-200 text-slate-500 hover:text-slate-700">
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* OUTPUT */}
          <div className="space-y-4">
            {!result && !loading && (
              <Card className="shadow-sm border-dashed border-2 border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <FlaskConical size={48} className="mb-4 opacity-30" />
                  <p className="text-sm">Results will appear here after prediction</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-primary">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p className="text-sm font-medium">Running compatibility analysis…</p>
                </CardContent>
              </Card>
            )}

            {result && (<>
              {result.excipient_type && result.excipient_type !== 'Unknown' && (
                <Card className="shadow-sm border-border">
                  <CardContent className="py-4 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-primary" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Excipient Type</span>
                      <span className="text-sm font-semibold text-foreground">{result.excipient_type}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-600 flex items-center gap-2">
                    Physical Compatibility
                    <Badge className={`text-xs capitalize border ${stabilityColor(result.physical_compatibility)}`}>
                      {result.physical_compatibility}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <Info size={14} className="shrink-0 mt-0.5 text-primary" />
                    <p>{result.physical_reasoning}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-600 flex items-center gap-2">
                    Chemical Compatibility
                    <Badge className={`text-xs capitalize border ${stabilityColor(result.chemical_compatibility)}`}>
                      {result.chemical_compatibility}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <Info size={14} className="shrink-0 mt-0.5 text-primary" />
                    <p>{result.chemical_reasoning}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-600">Final Compatibility Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${finalLabelColor(result.final_label)}`}>
                      {formatFinalLabel(result.final_label)}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">Confidence</div>
                      <div className="text-2xl font-bold text-slate-800">{confidencePct}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${
                      result.final_label === 'incompatible' ? 'bg-red-500'
                      : result.final_label === 'partially_compatible' ? 'bg-yellow-400'
                      : 'bg-green-500'}`}
                      style={{ width: `${confidencePct}%` }} />
                  </div>
                </CardContent>
              </Card>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
