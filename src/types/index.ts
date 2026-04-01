export interface PredictionInput {
  drugName: string;
  smilesCode: string;
  excipient: string;
}

export interface PredictionResult {
  compatible: boolean;
  probability: number;
  riskLevel: "LOW" | "HIGH";
  summary: string[];
}

export type Excipient =
  | "Lactose Monohydrate"
  | "Microcrystalline Cellulose"
  | "Magnesium Stearate"
  | "PVP"
  | "Starch";

export const EXCIPIENTS: Excipient[] = [
  "Lactose Monohydrate",
  "Microcrystalline Cellulose",
  "Magnesium Stearate",
  "PVP",
  "Starch",
];
