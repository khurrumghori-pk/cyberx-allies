import { useState } from "react";
import { Building2, Radio, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  { id: "banking", label: "Banking", icon: Building2 },
  { id: "telecom", label: "Telecom", icon: Radio },
  { id: "government", label: "Government", icon: Landmark },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];

interface IndustryToggleProps {
  active: IndustryId;
  onChange: (id: IndustryId) => void;
}

const IndustryToggle = ({ active, onChange }: IndustryToggleProps) => (
  <div className="flex flex-wrap justify-center gap-3">
    {INDUSTRIES.map((ind) => (
      <button
        key={ind.id}
        onClick={() => onChange(ind.id)}
        className={cn(
          "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold border transition-all",
          active === ind.id
            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
            : "bg-secondary/60 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
        )}
      >
        <ind.icon className="h-4 w-4" />
        {ind.label}
      </button>
    ))}
  </div>
);

export default IndustryToggle;
