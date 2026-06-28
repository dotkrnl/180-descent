import { renderToString } from "katex";
import { escapeHtml } from "@lib/text/escape";
import type { Locale } from "@lib/schemas/day";

interface StatusChipOptions {
  status: string;
  label: string;
  printLabel?: string;
}

interface TipNoteOptions {
  text: string;
  locale?: Locale;
}

export function renderStatusChip(options: StatusChipOptions): string {
  const printLabel = options.printLabel ?? options.label;
  return `<span class="chip ${escapeHtml(options.status)}" data-print="${escapeHtml(printLabel)}"><i></i>${escapeHtml(options.label)}</span>`;
}

export function renderTipNote(options: TipNoteOptions): string {
  const label = options.locale === "zh" ? "显示说明" : "Show note";
  const note = escapeHtml(options.text);
  return `<span class="tip-note" data-tip-text="${note}"><button class="tip-note-mark" type="button" aria-expanded="false" aria-label="${escapeHtml(label)}"></button><span class="tip-note-box" data-tip="${note}" aria-hidden="true"></span></span>`;
}

export function renderMathHtml(latex: string, displayMode = false): string {
  return renderToString(latex.trim(), {
    displayMode,
    throwOnError: false,
    output: "html"
  });
}
