import { describe, expect, it } from "vitest";
import { renderMathHtml, renderStatusChip, renderTipNote } from "@lib/render/lesson-components";

describe("lesson MDX components", () => {
  it("renders the durable status chip markup", () => {
    expect(renderStatusChip({
      status: "hint",
      label: "Predictive coding · promising",
      printLabel: "promising"
    })).toBe('<span class="chip hint" data-print="promising"><i></i>Predictive coding · promising</span>');
  });

  it("renders localized tip notes with the existing DOM contract", () => {
    expect(renderTipNote({
      text: "Epistemic means evidence-facing.",
      locale: "en"
    })).toBe('<span class="tip-note" data-tip-text="Epistemic means evidence-facing."><button class="tip-note-mark" type="button" aria-expanded="false" aria-label="?, Show note"></button><span class="tip-note-box" data-tip="Epistemic means evidence-facing." aria-hidden="true"></span></span>');

    expect(renderTipNote({
      text: "证据相关。",
      locale: "zh"
    })).toContain('aria-label="?, 显示说明"');
  });

  it("renders KaTeX without throwing on invalid author input", () => {
    expect(renderMathHtml("P(H \\mid E)", true)).toContain("katex-display");
    expect(renderMathHtml("\\notacommand", false)).toContain("notacommand");
  });
});
