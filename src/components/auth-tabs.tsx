"use client";

type AuthTabsProps = {
  mode: "login" | "register";
  onChange: (mode: "login" | "register") => void;
};

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="flex rounded-full bg-[var(--bg-elevated)] p-1">
      {(["login", "register"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium capitalize transition ${
            mode === m
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
