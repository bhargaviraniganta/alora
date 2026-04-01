// predictionStore.ts
// Stores PredictionTool form + result in module-level variables
// so state survives React unmount/remount when navigating away and back.

import type { PredictionResult } from '@/services/predictionService';

export interface FormState {
  drug_name: string;
  drug_smiles: string;
  excipient_name: string;
  excipient_smiles: string;
}

const DEFAULT_FORM: FormState = {
  drug_name: '',
  drug_smiles: '',
  excipient_name: '',
  excipient_smiles: '',
};

// Module-level singletons — persist across component unmounts
let _form: FormState = { ...DEFAULT_FORM };
let _result: PredictionResult | null = null;

export const predictionStore = {
  getForm: (): FormState => ({ ..._form }),
  setForm: (f: FormState) => { _form = { ...f }; },
  getResult: (): PredictionResult | null => _result,
  setResult: (r: PredictionResult | null) => { _result = r; },
  reset: () => { _form = { ...DEFAULT_FORM }; _result = null; },
};
