import React from "react";
import { PredictionInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ExcipientCombobox from "./ExcipientCombobox";
import DrugCombobox from "./DrugCombobox";
import SmilesCombobox from "./SmilesCombobox";
import drugData from "@/data/drug_excipient_data.json";
import { FlaskConical, Loader2, Atom, TestTube } from "lucide-react";

interface PredictionFormProps {
  input: PredictionInput;
  onChange: (input: PredictionInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  /* 🔹 FIXED: match JSON keys EXACTLY */
const normalize = (text: string) =>
  text.toLowerCase().replace(/\(.*?\)/g, "").trim();

const matchingSmiles = React.useMemo(() => {
  if (!input.drugName) return [];

  const inputNorm = normalize(input.drugName);

  const smilesSet = new Set<string>();

  drugData.forEach((d: any) => {
    if (
      normalize(d["DRUG NAME"]).includes(inputNorm) &&
      d["SMILE CODE (drug)"]
    ) {
      smilesSet.add(d["SMILE CODE (drug)"]);
    }
  });

  return Array.from(smilesSet);
}, [input.drugName]);

/* 
  return drugData
    .filter((d: any) =>
      normalize(d["DRUG NAME"]).includes(inputNorm)
    )
    .map((d: any) => d["SMILE CODE (drug)"]);
}, [input.drugName]); */


  return (
    <div className="bg-card rounded-xl shadow-card p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TestTube className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Input Parameters
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter drug and excipient details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drug Name */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            Drug Name
          </Label>

          <DrugCombobox
            value={input.drugName}
            onChange={(value) =>
              onChange({ ...input, drugName: value, smilesCode: "" })
            }
            disabled={isLoading}
          />
        </div>

        {/* SMILES Code */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Atom className="h-4 w-4 text-muted-foreground" />
            SMILES Code
          </Label>

          <SmilesCombobox
            value={input.smilesCode}
            options={matchingSmiles}
            onChange={(value) =>
              onChange({ ...input, smilesCode: value })
            }
            disabled={isLoading}
          />

          <p className="text-xs text-muted-foreground">
            Suggested from database based on selected drug
          </p>
        </div>

        {/* Excipient */}
        <div className="space-y-2">
          <Label>Excipient</Label>
          <ExcipientCombobox
            value={input.excipient}
            onChange={(value) =>
              onChange({ ...input, excipient: value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          variant="gradient"
          disabled={
            isLoading ||
            !input.drugName ||
            !input.smilesCode ||
            !input.excipient
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FlaskConical className="h-5 w-5" />
              Predict Compatibility
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Quick Tips
        </h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>• Use canonical SMILES for consistent results</li>
          <li>• Check stereochemistry when applicable</li>
          <li>• Consider salt forms in drug name</li>
        </ul>
      </div>
    </div>
  );
};

export default PredictionForm;
