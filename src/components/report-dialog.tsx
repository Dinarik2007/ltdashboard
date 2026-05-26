import * as React from "react";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  exportCSV,
  exportPDF,
  PERIOD_LABEL,
  SECTIONS,
  type Format,
  type Period,
  type SectionKey,
} from "@/lib/report-export";

const PERIODS: Period[] = ["7", "30", "90", "ytd"];

export function ReportDialog({ initialPeriod = "30" as Period }: { initialPeriod?: Period }) {
  const [open, setOpen] = React.useState(false);
  const [period, setPeriod] = React.useState<Period>(initialPeriod);
  const [format, setFormat] = React.useState<Format>("pdf");
  const [sections, setSections] = React.useState<Set<SectionKey>>(
    new Set(SECTIONS.map((s) => s.key)),
  );
  const [includeHeader, setIncludeHeader] = React.useState(true);
  const [includeSummary, setIncludeSummary] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) setPeriod(initialPeriod);
  }, [open, initialPeriod]);

  const toggle = (k: SectionKey) => {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const allSelected = sections.size === SECTIONS.length;
  const toggleAll = () => {
    setSections(allSelected ? new Set() : new Set(SECTIONS.map((s) => s.key)));
  };

  const handleDownload = async () => {
    const selected = SECTIONS.filter((s) => sections.has(s.key)).map((s) => s.key);
    if (!selected.length) return;
    setLoading(true);
    try {
      if (format === "csv") {
        exportCSV(period, selected, includeHeader);
      } else {
        await exportPDF(period, selected, { includeHeader, includeSummary });
      }
      toast.success("Отчёт готов", { description: `Скачан ${format.toUpperCase()} за «${PERIOD_LABEL[period]}»` });
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сформировать отчёт");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl gradient-leaf text-primary-foreground shadow-md shadow-accent/30 hover:opacity-95">
          <Sparkles className="mr-2 h-4 w-4" /> Отчёт
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Сформировать отчёт
          </DialogTitle>
          <DialogDescription>
            Выберите период, формат и какие блоки включить в выгрузку.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Период</div>
            <RadioGroup
              value={period}
              onValueChange={(v) => setPeriod(v as Period)}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {PERIODS.map((p) => (
                <Label
                  key={p}
                  htmlFor={`period-${p}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs hover:bg-accent/40"
                >
                  <RadioGroupItem id={`period-${p}`} value={p} />
                  {PERIOD_LABEL[p]}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Формат</div>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as Format)}
              className="flex gap-2"
            >
              {(["pdf", "csv"] as Format[]).map((f) => (
                <Label
                  key={f}
                  htmlFor={`fmt-${f}`}
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm hover:bg-accent/40"
                >
                  <RadioGroupItem id={`fmt-${f}`} value={f} />
                  <span className="uppercase font-medium">{f}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Состав отчёта</div>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? "Снять все" : "Выбрать все"}
              </button>
            </div>
            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-border/60 bg-background/40 p-2">
              {SECTIONS.map((s) => (
                <Label
                  key={s.key}
                  htmlFor={`sec-${s.key}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/40"
                >
                  <Checkbox
                    id={`sec-${s.key}`}
                    checked={sections.has(s.key)}
                    onCheckedChange={() => toggle(s.key)}
                  />
                  {s.label}
                </Label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Доп. опции</div>
            <div className="space-y-1">
              <Label htmlFor="opt-header" className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  id="opt-header"
                  checked={includeHeader}
                  onCheckedChange={(v) => setIncludeHeader(!!v)}
                />
                Шапка с заголовком и датой генерации
              </Label>
              <Label htmlFor="opt-summary" className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  id="opt-summary"
                  checked={includeSummary}
                  onCheckedChange={(v) => setIncludeSummary(!!v)}
                  disabled={format !== "pdf"}
                />
                Сводка в начале PDF
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button onClick={handleDownload} disabled={!sections.size || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Скачать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}