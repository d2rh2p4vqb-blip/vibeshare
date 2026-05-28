"use client";
import { Button } from "@/components/ui/button";

interface HotTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function HotTabs({ value, onChange, options }: HotTabsProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Button key={opt.value} variant={value === opt.value ? "default" : "outline"} size="sm" onClick={() => onChange(opt.value)}>
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
