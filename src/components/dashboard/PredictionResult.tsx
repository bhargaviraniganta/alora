import React from "react";
import { PredictionResult as PredictionResultType } from "@/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  BarChart3,
  FileText,
  Beaker,
} from "lucide-react";

interface PredictionResultProps {
  result: PredictionResultType | null;
  isLoading: boolean;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-card p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Prediction Analysis</h2>
            <p className="text-sm text-muted-foreground">Analyzing compatibility...</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-muted-foreground">Running ML prediction model...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-card rounded-xl shadow-card p-6 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Prediction Analysis</h2>
            <p className="text-sm text-muted-foreground">Results will appear here</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Beaker className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No Prediction Yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter drug and excipient information on the left panel, then click
            "Predict Compatibility" to see results.
          </p>
        </div>
      </div>
    );
  }

  const isCompatible = result.compatible;
  const isHighRisk = result.riskLevel === "HIGH";

  return (
    <div className="bg-card rounded-xl shadow-card p-6 h-full animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Prediction Analysis</h2>
      </div>

      {/* Compatibility Status */}
      <div
        className={`rounded-lg p-4 mb-6 ${
          isCompatible
            ? "bg-success-light border border-success/20"
            : "bg-danger-light border border-danger/20"
        }`}
      >
        <div className="flex items-center gap-3">
          {isCompatible ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
          <h3
            className={`text-xl font-bold ${
              isCompatible ? "text-success" : "text-destructive"
            }`}
          >
            {isCompatible ? "COMPATIBLE" : "NON-COMPATIBLE"}
          </h3>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Probability Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {result.probability.toFixed(1)}
            </span>
            <span className="text-muted-foreground">%</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompatible ? "gradient-success" : "gradient-danger"
              }`}
              style={{ width: `${result.probability}%` }}
            />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Risk Level</span>
          </div>
          <div className="flex items-center gap-2">
            {isHighRisk ? (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-success" />
            )}
            <span
              className={`text-2xl font-bold ${
                isHighRisk ? "text-destructive" : "text-success"
              }`}
            >
              {result.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Chemical Interaction Insight */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Chemical Interaction Insight</h3>
        </div>
        
        <h4 className="text-sm font-medium text-foreground mb-3">Analysis Summary:</h4>
        
        <ul className="space-y-2 pl-1">
          {result.summary.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm"
            >
              <span
                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  index < 2 ? "bg-primary" : isCompatible ? "bg-success" : "bg-warning"
                }`}
              />
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PredictionResult;
