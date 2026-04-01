import React, { useState } from "react";
import { PredictionInput, PredictionResult as PredictionResultType } from "@/types";
import { predictionService } from "@/services/predictionService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PredictionForm from "@/components/dashboard/PredictionForm";
import PredictionResultComponent from "@/components/dashboard/PredictionResult";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const [input, setInput] = useState<PredictionInput>({
    drugName: "",
    smilesCode: "",
    excipient: "",
  });
  const [result, setResult] = useState<PredictionResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (!input.drugName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a drug name",
        variant: "destructive",
      });
      return;
    }

    if (!input.smilesCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a SMILES code",
        variant: "destructive",
      });
      return;
    }

    if (!predictionService.validateSmiles(input.smilesCode)) {
      toast({
        title: "Invalid SMILES",
        description: "Please enter a valid SMILES notation",
        variant: "destructive",
      });
      return;
    }

    if (!input.excipient) {
      toast({
        title: "Validation Error",
        description: "Please select an excipient",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const prediction = await predictionService.predict(input);
      setResult(prediction);
      toast({
        title: "Analysis Complete",
        description: `Prediction: ${prediction.compatible ? "Compatible" : "Non-Compatible"}`,
      });
    } catch (error) {
      toast({
        title: "Prediction Error",
        description: error instanceof Error ? error.message : "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Drug-Excipient Compatibility Predictor
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze potential interactions between active pharmaceutical ingredients and excipients
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <div className="min-w-[400px] flex-1">
            <PredictionForm
              input={input}
              onChange={setInput}
              onSubmit={handlePredict}
              isLoading={isLoading}
            />
          </div>
          <div className="min-w-[400px] flex-1">
            <PredictionResultComponent result={result} isLoading={isLoading} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
