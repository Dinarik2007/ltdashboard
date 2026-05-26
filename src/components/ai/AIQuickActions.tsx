import { QUICK_ACTIONS, type AIMode } from "@/lib/ai-prompts";

export function AIQuickActions({
  onPick,
}: {
  onPick: (prompt: string, mode: AIMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onPick(a.prompt, a.mode)}
          className="group text-left rounded-xl border border-border/60 bg-card/60 hover:bg-accent hover:border-primary/50 transition-all p-3 cursor-pointer"
        >
          <div className="text-lg leading-none mb-1.5">{a.emoji}</div>
          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {a.label}
          </div>
        </button>
      ))}
    </div>
  );
}