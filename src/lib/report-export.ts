import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  kpis,
  spendByChannel,
  reachWeekly,
  subscribersByPlatform,
  romiByCampaign,
  bestChannels,
  bestProducts,
  socialPosts,
  budgets,
} from "@/lib/mock-data";

export type Period = "7" | "30" | "90" | "ytd";
export type Format = "pdf" | "csv";

export type SectionKey =
  | "kpi"
  | "spend"
  | "reach"
  | "subs"
  | "romi"
  | "channels"
  | "products"
  | "posts"
  | "budgets";

export const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "kpi", label: "KPI (Расходы, Охват, Подписчики, ROMI)" },
  { key: "spend", label: "Расходы по каналам" },
  { key: "reach", label: "Охват по неделям" },
  { key: "subs", label: "Подписчики по платформам" },
  { key: "romi", label: "ROMI по кампаниям" },
  { key: "channels", label: "Лучшие каналы" },
  { key: "products", label: "Топ SKU" },
  { key: "posts", label: "Соцпосты" },
  { key: "budgets", label: "Бюджеты (план vs факт)" },
];

export const PERIOD_LABEL: Record<Period, string> = {
  "7": "Последние 7 дней",
  "30": "Последние 30 дней",
  "90": "Последние 90 дней",
  ytd: "С начала года",
};

function monthsCount(p: Period): number {
  if (p === "7") return 1;
  if (p === "30") return 2;
  if (p === "90") return 3;
  return 12;
}

function weeksCount(p: Period): number {
  if (p === "7") return 1;
  if (p === "30") return 4;
  if (p === "90") return 12;
  return 12;
}

type Section = { title: string; head: string[]; body: (string | number)[][] };

export function buildSections(period: Period, selected: SectionKey[]): Section[] {
  const has = (k: SectionKey) => selected.includes(k);
  const out: Section[] = [];
  const mCount = monthsCount(period);
  const wCount = weeksCount(period);

  if (has("kpi")) {
    out.push({
      title: "KPI",
      head: ["Показатель", "Значение", "Δ %", "Подсказка"],
      body: kpis.map((k) => [k.label, k.value, `${k.delta > 0 ? "+" : ""}${k.delta}%`, k.hint ?? ""]),
    });
  }
  if (has("spend")) {
    const rows = spendByChannel.slice(-mCount);
    out.push({
      title: "Расходы по каналам (тыс. ₽)",
      head: ["Месяц", "VK", "Telegram", "YouTube", "Instagram", "Dzen"],
      body: rows.map((r) => [r.month, r.VK, r.Telegram, r.YouTube, r.Instagram, r.Dzen]),
    });
  }
  if (has("reach")) {
    const rows = reachWeekly.slice(-wCount);
    out.push({
      title: "Охват по неделям (тыс.)",
      head: ["Неделя", "Охват"],
      body: rows.map((r) => [r.w, r.reach]),
    });
  }
  if (has("subs")) {
    const rows = subscribersByPlatform.slice(-mCount);
    out.push({
      title: "Подписчики по платформам (тыс.)",
      head: ["Месяц", "VK", "Telegram", "YouTube", "Instagram", "Dzen"],
      body: rows.map((r) => [r.m, r.VK, r.Telegram, r.YouTube, r.Instagram, r.Dzen]),
    });
  }
  if (has("romi")) {
    out.push({
      title: "ROMI по кампаниям (%)",
      head: ["Кампания", "ROMI"],
      body: romiByCampaign.map((r) => [r.name, `${r.romi}%`]),
    });
  }
  if (has("channels")) {
    out.push({
      title: "Лучшие каналы",
      head: ["Канал", "ROMI %", "Расход", "Доля %"],
      body: bestChannels.map((c) => [c.name, c.romi, c.spend, c.share]),
    });
  }
  if (has("products")) {
    out.push({
      title: "Топ SKU",
      head: ["SKU", "Название", "Категория", "Выручка", "ROMI %", "Остаток"],
      body: bestProducts.map((p) => [p.sku, p.name, p.category, p.revenue, p.romi, p.stock]),
    });
  }
  if (has("posts")) {
    out.push({
      title: "Соцпосты",
      head: ["Платформа", "Заголовок", "Дата", "Охват", "ER %", "Статус"],
      body: socialPosts.map((p) => [p.platform, p.title, p.date, p.reach, p.er, p.status]),
    });
  }
  if (has("budgets")) {
    out.push({
      title: "Бюджеты — План vs Факт (тыс. ₽)",
      head: ["Канал", "План", "Факт", "Исп. %"],
      body: budgets.map((b) => [b.channel, b.plan, b.fact, `${Math.round((b.fact / b.plan) * 100)}%`]),
    });
  }
  return out;
}

function fileBase(period: Period): string {
  const d = new Date().toISOString().slice(0, 10);
  return `report-${period}-${d}`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v: string | number): string {
  const s = String(v);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCSV(period: Period, selected: SectionKey[], includeHeader: boolean) {
  const sections = buildSections(period, selected);
  const lines: string[] = [];
  if (includeHeader) {
    lines.push(`Отчёт;${PERIOD_LABEL[period]}`);
    lines.push(`Сгенерировано;${new Date().toLocaleString("ru-RU")}`);
    lines.push("");
  }
  for (const s of sections) {
    lines.push(s.title);
    lines.push(s.head.map(csvEscape).join(";"));
    for (const row of s.body) lines.push(row.map(csvEscape).join(";"));
    lines.push("");
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  download(blob, `${fileBase(period)}.csv`);
}

// Cache fetched font as base64
let robotoB64: string | null = null;
async function loadRoboto(): Promise<string | null> {
  if (robotoB64) return robotoB64;
  try {
    const url = "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf";
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    robotoB64 = btoa(bin);
    return robotoB64;
  } catch {
    return null;
  }
}

export async function exportPDF(
  period: Period,
  selected: SectionKey[],
  opts: { includeHeader: boolean; includeSummary: boolean }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const font = await loadRoboto();
  if (font) {
    doc.addFileToVFS("Roboto-Regular.ttf", font);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto", "normal");
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;

  if (opts.includeHeader) {
    doc.setFontSize(18);
    doc.text("Маркетинговый отчёт", 40, y);
    y += 22;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Период: ${PERIOD_LABEL[period]}`, 40, y);
    doc.text(`Сгенерировано: ${new Date().toLocaleString("ru-RU")}`, pageWidth - 40, y, { align: "right" });
    doc.setTextColor(0);
    y += 18;
  }

  const sections = buildSections(period, selected);

  if (opts.includeSummary && sections.length) {
    doc.setFontSize(12);
    doc.text("Сводка", 40, y);
    y += 14;
    doc.setFontSize(10);
    const lines = [
      `Секций в отчёте: ${sections.length}`,
      `Период: ${PERIOD_LABEL[period]}`,
      ...sections.map((s) => `• ${s.title} — ${s.body.length} строк`),
    ];
    for (const l of lines) {
      doc.text(l, 40, y);
      y += 14;
    }
    y += 6;
  }

  for (const s of sections) {
    doc.setFontSize(12);
    doc.text(s.title, 40, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [s.head],
      body: s.body.map((r) => r.map((c) => String(c))),
      styles: { font: font ? "Roboto" : "helvetica", fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [22, 84, 60], textColor: 255, font: font ? "Roboto" : "helvetica" },
      margin: { left: 40, right: 40 },
    });
    // @ts-expect-error autotable adds lastAutoTable
    y = (doc.lastAutoTable?.finalY ?? y) + 24;
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      y = 40;
    }
  }

  doc.save(`${fileBase(period)}.pdf`);
}