"use client";

type DateSelectorProps = {
  value: string;
  max: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function DateSelector({
  value,
  max,
  disabled = false,
  onChange,
}: DateSelectorProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <label htmlFor="date-selector" className="text-sm font-medium text-slate-100">
        表示日
      </label>
      <input
        id="date-selector"
        type="date"
        value={value}
        max={max}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/15 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
      />
    </div>
  );
}
