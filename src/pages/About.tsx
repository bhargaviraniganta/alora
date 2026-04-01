import React from "react";
import { FlaskConical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-6">
          <FlaskConical className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Drug–Excipient Compatibility Predictor
        </h1>
      </div>

      {/* What is this tool? */}
      <Card className="mb-6 border-border shadow-card">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔹 What is this tool?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This is an AI-powered calculator for pharmaceutical scientists. It predicts whether a Drug (API) and an Excipient (inactive ingredient) can be safely mixed together without reacting.
          </p>
        </CardContent>
      </Card>

      {/* Why did we build it? */}
      <Card className="mb-6 border-border shadow-card">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔹 Why did we build it?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Before making a tablet or capsule, scientists must test if the ingredients are compatible.
          </p>
          <div className="space-y-3">
            <div className="pl-4 border-l-2 border-primary/30">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Old Way:</strong> Testing in a lab takes weeks and wastes expensive chemicals.
              </p>
            </div>
            <div className="pl-4 border-l-2 border-primary">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Our Way:</strong> This tool uses computer algorithms (AI) to check compatibility in seconds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How does it work? */}
      <Card className="mb-6 border-border shadow-card">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔹 How does it work?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">You Enter:</p>
                <p className="text-muted-foreground">The drug's chemical structure (SMILES code) and choose an excipient with it's SMILES code.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">AI Analyzes:</p>
                <p className="text-muted-foreground">The system calculates chemical properties like molecular weight and acidity.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Result:</p>
                <p className="text-muted-foreground">It shows the excipient type, physical compatibility, chemical compatibility, with reasoning and the final prediction for the selected pair.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal */}
      <Card className="border-border shadow-card bg-accent/30">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            🔹 Goal
          </h2>
          <p className="text-foreground leading-relaxed font-medium">
            To help make safer medicines faster and cheaper by catching problems early.
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default About;
