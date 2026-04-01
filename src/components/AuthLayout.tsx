import React from "react";
import Logo from "./Logo";
import { FlaskConical, Shield, Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Logo size="lg" />
          
          <div className="space-y-8">
            <h1 className="text-4xl font-bold leading-tight">
              AI-Powered Drug Compatibility Analysis
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Predict drug-excipient interactions with advanced machine learning.
              Make informed formulation decisions faster.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-foreground/10 rounded-lg">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Accurate Predictions</h3>
                  <p className="text-sm opacity-80">ML-based compatibility analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-foreground/10 rounded-lg">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Results</h3>
                  <p className="text-sm opacity-80">Get predictions in seconds</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-foreground/10 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Risk Assessment</h3>
                  <p className="text-sm opacity-80">Comprehensive safety insights</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm opacity-70">
            © 2026 Alora. Predict prevent perform.
          </p>
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
