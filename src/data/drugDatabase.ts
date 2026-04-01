// src/data/drugDatabase.ts

import rawData from "./drug_excipient_data.json";

/**
 * Shape expected by DatabaseViewer.tsx
 */
export interface DrugEntry {
  id: number;
  drugName: string;
  smilesCode: string;
  excipient: string;
}

/**
 * Convert spreadsheet JSON → table-ready data
 * This runs ONCE at app load (very fast)
 */
export const drugDatabase: DrugEntry[] = (rawData as any[]).map(
  (row, index) => ({
    id: index + 1,
    drugName: String(row["DRUG NAME"] || "").trim(),
    smilesCode: String(row["SMILE CODE (drug)"] || "").trim(),
    excipient: String(row["EXCIPIENT NAME"] || "").trim(),
  })
);

/**
 * Used for badge count
 */
export const getDrugCount = () => drugDatabase.length;
