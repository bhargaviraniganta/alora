import React from "react";
import { Pill } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", showText = true }) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="gradient-primary p-2 rounded-xl shadow-card">
          <Pill
            size={sizes[size].icon}
            className="text-primary-foreground"
            strokeWidth={2}
          />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-foreground ${sizes[size].text}`}>
            Alora
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            predict prevent perform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
