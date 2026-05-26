import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AIChatPanel } from "./AIChatPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AIAssistantLauncher() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      <button
        type="button"
        aria-label="AI Marketing Assistant"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full",
          "bg-gradient-to-br from-primary via-primary to-primary/70",
          "text-primary-foreground shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.6)]",
          "flex items-center justify-center cursor-pointer",
          "transition-transform hover:scale-105 active:scale-95",
          "ring-1 ring-primary/40",
        )}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0 bg-card/95 backdrop-blur-xl border-l border-border/60"
        >
          <AIChatPanel onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}