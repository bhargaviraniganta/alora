// Updated prediction service — calls the v5 model on HuggingFace Spaces
// Backend returns: physical_compatibility, physical_reasoning,
//                  chemical_compatibility, chemical_reasoning,
//                  excipient_type, final_label, confidence

const HF_API_URL = import.meta.env.VITE_HF_API_URL || 'https://bhargaviraniganta-drug-excipient-compat.hf.space';

export interface PredictionRequest {
  drug_name: string;
  drug_smiles: string;
  excipient_name: string;
  excipient_smiles: string;
}

export interface PredictionResult {
  physical_compatibility: 'stable' | 'unstable';
  physical_reasoning: string;
  chemical_compatibility: 'stable' | 'unstable';
  chemical_reasoning: string;
  excipient_type: string;
  final_label: 'compatible' | 'incompatible' | 'partially_compatible';
  confidence: number;
}

export async function predictCompatibility(req: PredictionRequest): Promise<PredictionResult> {
  const response = await fetch(`${HF_API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).detail || `Server error ${response.status}`);
  }

  return response.json() as Promise<PredictionResult>;
}

/** Human-readable label for final_label */
export function formatFinalLabel(label: string): string {
  switch (label) {
    case 'compatible':          return 'Compatible';
    case 'incompatible':        return 'Incompatible';
    case 'partially_compatible':return 'Partially Compatible';
    default:                    return label;
  }
}

/** Tailwind colour class for final_label badge */
export function finalLabelColor(label: string): string {
  switch (label) {
    case 'compatible':          return 'bg-green-100 text-green-800 border-green-200';
    case 'incompatible':        return 'bg-red-100 text-red-800 border-red-200';
    case 'partially_compatible':return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:                    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/** Tailwind colour class for physical/chemical stability badge */
export function stabilityColor(status: string): string {
  return status === 'stable'
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';
}
