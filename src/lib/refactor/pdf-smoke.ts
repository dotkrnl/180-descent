import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

export interface PdfSmokeOptions {
  root: string;
}

interface CommandResult {
  command: string;
  ok: boolean;
  status: number | null;
  durationMs: number;
  error: string | null;
  stdout: string;
  stderr: string;
}

interface CandidateResult extends CommandResult {
  id: string;
  label: string;
  input: string;
  output: string;
  passed: boolean;
}

const smoke = {
  title: "PDF Renderer Smoke",
  english: "Knowledge needs more than a justified true belief.",
  chinese: "知识不只是有理由的真信念。",
  mathText: "P(H|E) = P(E|H)P(H)/P(E)",
  interaction: "fixture-interaction: static-figure",
  svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"60\" viewBox=\"0 0 120 60\"><rect width=\"120\" height=\"60\" fill=\"#f6f1e8\"/><circle cx=\"35\" cy=\"30\" r=\"18\" fill=\"#335c67\"/><path d=\"M65 44 L95 16\" stroke=\"#9e2a2b\" stroke-width=\"6\"/></svg>"
};

export async function runPdfRendererSmoke(options: PdfSmokeOptions): Promise<{
  reportPath: string;
  outputDir: string;
  results: CandidateResult[];
}> {
  const outputDir = path.join(options.root, "dist/refactor/pdf-smoke");
  const reportPath = path.join(options.root, "docs/refactor/pdf-renderer-smoke.md");
  const localBin = path.join(options.root, "node_modules/.bin");

  await writeSmokeSources(outputDir);

  const results = [
    candidateResult(outputDir, "latex-pandoc", "LaTeX via Pandoc/XeLaTeX", "smoke.md", "pandoc-xelatex.pdf", runCommand(outputDir, "pandoc", [
      "smoke.md",
      "--pdf-engine=xelatex",
      "-V",
      "mainfont=Helvetica Neue",
      "-V",
      "CJKmainfont=Hiragino Sans GB",
      "-o",
      "pandoc-xelatex.pdf"
    ])),
    candidateResult(outputDir, "tectonic", "Tectonic", "smoke.tex", "smoke.pdf", runCommand(outputDir, "tectonic", ["smoke.tex", "--outdir", outputDir])),
    candidateResult(outputDir, "typst", "Typst", "smoke.typ", "typst.pdf", runCommand(outputDir, "typst", ["compile", "smoke.typ", "typst.pdf"])),
    candidateResult(outputDir, "weasyprint", "WeasyPrint", "smoke.html", "weasyprint.pdf", runCommand(outputDir, "weasyprint", ["smoke.html", "weasyprint.pdf"])),
    candidateResult(outputDir, "vivliostyle", "Vivliostyle CLI", "smoke.html", "vivliostyle.pdf", runCommand(outputDir, commandPath(localBin, "vivliostyle"), ["build", "smoke.html", "-o", "vivliostyle.pdf"])),
    candidateResult(outputDir, "playwright", "Playwright/Chromium", "smoke.html", "playwright.pdf", await runPlaywrightSmoke(outputDir))
  ];

  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, renderPdfSmokeReport(results));

  return { reportPath, outputDir, results };
}

export function trimOutput(value = ""): string {
  const text = value.trim();
  if (text.length <= 1200) return text;
  return `${text.slice(0, 1200)}...`;
}

export function summarizePdfSmokeFailure(result: Pick<CandidateResult, "error" | "stderr" | "stdout">): string {
  return (result.error || result.stderr || result.stdout || "failed").replace(/\|/g, "/").split("\n")[0];
}

function runCommand(outputDir: string, command: string, args: string[]): CommandResult {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: outputDir,
    encoding: "utf8",
    timeout: 45000,
    stdio: ["ignore", "pipe", "pipe"]
  });

  return {
    command: [command, ...args].join(" "),
    ok: result.status === 0 && !result.error,
    status: result.status,
    durationMs: Date.now() - started,
    error: result.error?.message ?? null,
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr)
  };
}

async function writeSmokeSources(outputDir: string): Promise<void> {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await writeFile(path.join(outputDir, "smoke.md"), [
    "---",
    "title: PDF Renderer Smoke",
    "---",
    "",
    "# PDF Renderer Smoke",
    "",
    smoke.english,
    "",
    smoke.chinese,
    "",
    `Math: $${smoke.mathText}$`,
    "",
    `Interaction fallback: ${smoke.interaction}`
  ].join("\n"));

  await writeFile(path.join(outputDir, "smoke.tex"), [
    "\\documentclass{article}",
    "\\usepackage{fontspec}",
    "\\usepackage{amsmath}",
    "\\usepackage{xeCJK}",
    "\\setmainfont{Helvetica Neue}",
    "\\setCJKmainfont{Hiragino Sans GB}",
    "\\begin{document}",
    "\\section*{PDF Renderer Smoke}",
    smoke.english,
    "",
    smoke.chinese,
    "",
    `\\[${smoke.mathText}\\]`,
    "",
    `Interaction fallback: ${smoke.interaction}`,
    "\\end{document}"
  ].join("\n"));

  await writeFile(path.join(outputDir, "smoke.typ"), [
    "#set document(title: \"PDF Renderer Smoke\")",
    "= PDF Renderer Smoke",
    "",
    smoke.english,
    "",
    smoke.chinese,
    "",
    `$ ${smoke.mathText} $`,
    "",
    `#figure([${smoke.interaction}], caption: [fixture interaction])`
  ].join("\n"));

  await writeFile(path.join(outputDir, "smoke.html"), [
    "<!doctype html>",
    "<html lang=\"en\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <title>PDF Renderer Smoke</title>",
    "  <style>",
    "    body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.5; }",
    "    figure { border: 1px solid #999; padding: 12px; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <h1>PDF Renderer Smoke</h1>",
    `  <p>${smoke.english}</p>`,
    `  <p lang="zh-Hans">${smoke.chinese}</p>`,
    `  <p><math><mi>P</mi><mo>(</mo><mi>H</mi><mo>|</mo><mi>E</mi><mo>)</mo></math> ${smoke.mathText}</p>`,
    `  ${smoke.svg}`,
    `  <figure><figcaption>${smoke.interaction}</figcaption></figure>`,
    "</body>",
    "</html>"
  ].join("\n"));
}

async function runPlaywrightSmoke(outputDir: string): Promise<CommandResult> {
  const started = Date.now();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file://${path.join(outputDir, "smoke.html")}`);
    await page.pdf({ path: path.join(outputDir, "playwright.pdf"), format: "Letter", printBackground: true });
    return {
      command: "playwright chromium page.pdf smoke.html",
      ok: true,
      status: 0,
      durationMs: Date.now() - started,
      error: null,
      stdout: "",
      stderr: ""
    };
  } catch (error) {
    return {
      command: "playwright chromium page.pdf smoke.html",
      ok: false,
      status: null,
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      stdout: "",
      stderr: ""
    };
  } finally {
    await browser.close();
  }
}

function candidateResult(outputDir: string, id: string, label: string, input: string, output: string, result: CommandResult): CandidateResult {
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  const cjkMissing = /Missing character:[^\n]*(?:[\u4e00-\u9fff]|U\+[4-9][0-9A-F]{3}|0x[4-9][0-9a-f]{3})/i.test(combinedOutput)
    || /could not represent character [^\n]*(?:[\u4e00-\u9fff]|0x[4-9][0-9a-f]{3})/i.test(combinedOutput);
  const pdfValid = hasPdfHeader(path.join(outputDir, output));
  const passed = result.ok && !cjkMissing && pdfValid;

  return {
    id,
    label,
    input,
    output,
    ...result,
    passed,
    error: cjkMissing
      ? "mandatory smoke criterion failed: CJK glyphs missing"
      : pdfValid
        ? result.error
        : "mandatory smoke criterion failed: PDF output missing or invalid"
  };
}

function hasPdfHeader(filePath: string): boolean {
  if (!existsSync(filePath)) return false;
  return readFileSync(filePath).subarray(0, 5).toString("utf8") === "%PDF-";
}

function commandPath(localBin: string, command: string): string {
  const local = path.join(localBin, command);
  return existsSync(local) ? local : command;
}

function renderPdfSmokeReport(results: CandidateResult[]): string {
  const survivors = results.filter((result) => result.passed).map((result) => result.id);
  const eliminated = results.filter((result) => !result.passed).map((result) => result.id);

  return `${[
    "# PDF Renderer Smoke Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This is a Tier 1 smoke attempt for the free PDF renderer candidates. Generated PDFs stay under ignored `dist/refactor/pdf-smoke/` and are not committed.",
    "",
    "Smoke content includes English prose, Chinese prose, math text, inline SVG, and an interaction fallback label.",
    "",
    "## Summary",
    "",
    `- Survivors: ${survivors.join(", ") || "none"}`,
    `- Eliminated or unavailable: ${eliminated.join(", ") || "none"}`,
    "",
    "## Results",
    "",
    "| Candidate | Passed | Duration | Output | Notes |",
    "| --- | --- | ---: | --- | --- |",
    ...results.map((result) => `| ${[
      result.label,
      result.passed ? "yes" : "no",
      `${result.durationMs}ms`,
      result.output,
      result.passed ? "smoke PDF generated" : summarizePdfSmokeFailure(result)
    ].join(" | ")} |`),
    "",
    "## Raw Command Evidence",
    "",
    ...results.flatMap((result) => [
      `### ${result.label}`,
      "",
      `Command: \`${result.command}\``,
      `Status: ${result.status ?? "error"}`,
      result.error ? `Error: ${result.error}` : "Error: none",
      result.stdout ? `Stdout: ${fence(result.stdout)}` : "Stdout: empty",
      result.stderr ? `Stderr: ${fence(result.stderr)}` : "Stderr: empty",
      ""
    ])
  ].join("\n")}\n`;
}

function fence(value: string): string {
  return `\n\`\`\`txt\n${value}\n\`\`\``;
}
