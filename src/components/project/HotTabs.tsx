"use client";

interface HotTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function HotTabs({ value, onChange, options }: HotTabsProps) {
  return (
    <div className="inline-flex gap-0.5 bg-muted p-1 rounded-xl">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
