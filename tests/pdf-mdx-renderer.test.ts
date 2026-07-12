import path from "node:path";
import { describe, expect, it } from "vitest";
import { mdxToLatex } from "@lib/artifacts/pdf/xetex";

describe("PDF MDX renderer", () => {
  it("renders CompareList lesson items inside a ComparePanel", async () => {
    const latex = await renderMdx(String.raw`
<ComparePanel>
<CompareCard>
<CompareCardTitle>Fisher's significance test</CompareCardTitle>
<CompareCardMeta>1925 · evidential</CompareCardMeta>
<CompareList>
<LessonListItem lead="One hypothesis">No alternative required.</LessonListItem>
<LessonListItem>Investigate in context.</LessonListItem>
</CompareList>
</CompareCard>
</ComparePanel>
`);

    expect(latex).toContain("\\begin{comparebox}");
    expect(latex).toContain("Fisher's significance test");
    expect(latex).toContain("1925 · evidential");
    expect(latex).toContain("\\item \\textbf{One hypothesis} No alternative required.");
    expect(latex).toContain("\\item Investigate in context.");
    expect(latex).toContain("\\end{comparebox}");
  });

  it("preserves representative nested Markdown list structure", async () => {
    const latex = await renderMdx(String.raw`
- Outer body.
  1. First nested item.
  2. Second nested item.
- Sibling body.
`);

    expect(latex).toBe(String.raw`\begin{itemize}
\item Outer body. \begin{enumerate}
\item First nested item.
\item Second nested item.
\end{enumerate}
\item Sibling body.
\end{itemize}`);
  });

  it("uses explicit section pagination hints without depending on heading copy", async () => {
    const latex = await renderMdx(String.raw`
<SectionEyebrow pdfNeedspace="0.52">Scoreboard</SectionEyebrow>

## Any localized heading
`);

    expect(latex).toContain(String.raw`\Needspace{0.52\textheight}`);
    expect(latex).toContain(String.raw`\sectionwithlabel{Scoreboard}{Any localized heading}`);
  });
});

async function renderMdx(source: string): Promise<string> {
  const root = process.cwd();
  return mdxToLatex(source, {
    root,
    locale: "en",
    sourceFile: path.join(root, "tests/fixtures/pdf-renderer.mdx"),
    includeDeepDive: false,
    workDir: root,
    siteUrl: "https://example.test"
  });
}
