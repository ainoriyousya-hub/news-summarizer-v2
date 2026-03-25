"use client";

type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabPanelProps<T extends string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function TabPanel<T extends string>({
  tabs,
  value,
  onChange,
}: TabPanelProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.id === value;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-white text-slate-900 shadow-lg"
                : "bg-white/10 text-slate-100 hover:bg-white/20"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
