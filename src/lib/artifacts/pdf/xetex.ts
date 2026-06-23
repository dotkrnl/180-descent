import { execFile, execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import YAML from "yaml";
import { loadArtifactBookDays, type ArtifactBookDay } from "@lib/artifacts/book";
import type { Locale } from "@lib/schemas";

const execFileAsync = promisify(execFile);

export interface BuildAllPdfsOptions {
  root: string;
}

interface BookData {
  title: string;
  subtitle: string;
  authors: string;
  publisher: string;
  language: string;
  zh: {
    title: string;
    subtitle: string;
    authors: string;
    translators?: string;
    language: string;
  };
}

interface PdfEdition {
  locale: Locale;
  title: string;
  subtitle: string;
  authors: string;
  language: string;
  output: string;
  includeDeepDive?: boolean;
  days?: ArtifactBookDay[];
  singleDay?: boolean;
}

interface MdxLatexOptions {
  root: string;
  locale: Locale;
  sourceFile: string;
  includeDeepDive: boolean;
  workDir: string;
}

interface MdxRenderState {
  root: string;
  locale: Locale;
  sourceFile: string;
  sourceDir: string;
  includeDeepDive: boolean;
  workDir: string;
  imports: Map<string, string>;
  constants: Map<string, string>;
}

interface RenderContext {
  block?: boolean;
  tableCell?: boolean;
  listItem?: boolean;
  heading?: boolean;
}

type MdxNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  ordered?: boolean;
  children?: MdxNode[];
  name?: string;
  attributes?: MdxAttribute[];
};

type MdxAttribute = {
  type: string;
  name?: string;
  value?: string | null | {
    type: string;
    value?: string;
    data?: unknown;
  };
};

interface LatexTable {
  rows: string[][];
  headerRows: Set<number>;
}

export async function buildAllPdfs(options: BuildAllPdfsOptions): Promise<void> {
  const root = options.root;
  const book = YAML.parse(await readFile(path.join(root, "src/_data/book.yaml"), "utf8")) as BookData;

  await mkdir(path.join(root, "_site/downloads"), { recursive: true });
  await mkdir(path.join(root, "dist/downloads"), { recursive: true });

  await buildPdf({
    root,
    locale: "en",
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors,
    language: book.language,
    output: "180-descent.pdf"
  });

  await buildPdf({
    root,
    locale: "en",
    title: `${book.title}: Deep Dive`,
    subtitle: book.subtitle,
    authors: book.authors,
    language: book.language,
    output: "180-descent-deep-dive.pdf",
    includeDeepDive: true
  });

  await buildPdf({
    root,
    locale: "zh",
    title: book.zh.title,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    language: book.zh.language,
    output: "180-descent-zh.pdf"
  });

  await buildPdf({
    root,
    locale: "zh",
    title: `${book.zh.title}：专题深入版`,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    language: book.zh.language,
    output: "180-descent-zh-deep-dive.pdf",
    includeDeepDive: true
  });

  await buildDayPdfs(root, "en", book);
  await buildDayPdfs(root, "zh", book);
}

async function buildDayPdfs(root: string, locale: Locale, book: BookData): Promise<void> {
  const days = await loadArtifactBookDays(root, locale);
  for (const day of days) {
    const zh = locale === "zh";
    await buildPdf({
      root,
      locale,
      title: zh ? `${book.zh.title}：第 ${day.day} 日` : `${book.title}: Day ${day.day}`,
      subtitle: day.title,
      authors: zh ? book.zh.authors : book.authors,
      language: zh ? book.zh.language : book.language,
      output: zh ? `180-descent-zh-day-${day.path}.pdf` : `180-descent-day-${day.path}.pdf`,
      days: [day],
      includeDeepDive: true,
      singleDay: true
    });
  }
}

async function buildPdf(config: PdfEdition & { root: string }): Promise<void> {
  const root = config.root;
  const tempRoot = path.join(root, "tmp/pdfs");
  await mkdir(tempRoot, { recursive: true });
  const workDir = await mkdtemp(path.join(tempRoot, "xetex-"));
  const texPath = path.join(workDir, "book.tex");
  const outputPath = path.join(workDir, "book.pdf");
  let failed = false;

  try {
    const tex = await buildLatexDocument(config, workDir);
    await writeFile(texPath, tex);
    await runXeLaTeX(texPath, workDir);

    const distPath = path.join(root, "dist/downloads", config.output);
    const sitePath = path.join(root, "_site/downloads", config.output);
    await copyFile(outputPath, distPath);
    await copyFile(outputPath, sitePath);
  } catch (error) {
    failed = true;
    const log = await readFile(path.join(workDir, "book.log"), "utf8").catch(() => "");
    const keepNote = process.env.PDF_KEEP_TEMP === "1" ? `\n\nTemporary PDF build directory kept at ${workDir}` : "";
    const message = log ? `${toError(error).message}\n\n${lastLatexLogLines(log)}${keepNote}` : `${toError(error).message}${keepNote}`;
    throw new Error(`XeTeX PDF build failed for ${config.output}: ${message}`);
  } finally {
    if (!failed || process.env.PDF_KEEP_TEMP !== "1") {
      await rm(workDir, { recursive: true, force: true });
    }
  }
}

async function buildLatexDocument(config: PdfEdition & { root: string }, workDir: string): Promise<string> {
  const days = config.days ?? await loadArtifactBookDays(config.root, config.locale);
  const chunks: string[] = [];

  chunks.push(titlePageLatex(config));
  if (!config.singleDay) {
    chunks.push("\\frontmatter\n\\tableofcontents\n\\mainmatter");
    chunks.push(await introductionLatex(config, workDir));
  } else {
    chunks.push("\\mainmatter");
  }

  let currentBlock = "";
  for (const day of days) {
    if (!config.singleDay && dayBlock(day) !== currentBlock) {
      currentBlock = dayBlock(day);
      chunks.push(`\\part*{${latexEscape(currentBlock)}}\n\\addcontentsline{toc}{part}{${latexEscape(currentBlock)}}`);
    }
    chunks.push(dayLatex(day, config));
    chunks.push(await mdxToLatex(day.bodySource, {
      root: config.root,
      locale: config.locale,
      sourceFile: path.join(config.root, "src/content/days", day.path, day.bodyPath),
      includeDeepDive: Boolean(config.includeDeepDive),
      workDir
    }));

    if (config.includeDeepDive) {
      for (const appendix of day.appendices) {
        const label = config.locale === "zh" ? "可选附录" : "Optional appendix";
        const title = appendix.title ?? appendix.id;
        chunks.push(`\\clearpage\n\\section*{${latexEscape(label)}: ${latexEscape(title)}}\n\\addcontentsline{toc}{section}{${latexEscape(label)}: ${latexEscape(title)}}`);
        chunks.push(await mdxToLatex(appendix.bodySource, {
          root: config.root,
          locale: config.locale,
          sourceFile: path.join(config.root, "src/content/days", day.path, appendix.bodyPath),
          includeDeepDive: true,
          workDir
        }));
      }
    }
  }

  return [
    latexPreamble(config),
    "\\begin{document}",
    chunks.join("\n\n"),
    "\\end{document}"
  ].join("\n");
}

async function introductionLatex(config: PdfEdition & { root: string }, workDir: string): Promise<string> {
  const sourceFile = path.join(config.root, "src/app/content", `introduction.${config.locale}.mdx`);
  const source = await readFile(sourceFile, "utf8");
  const title = config.locale === "zh" ? "导言" : "Introduction";
  return [
    `\\chapter*{${latexEscape(title)}}`,
    `\\addcontentsline{toc}{chapter}{${latexEscape(title)}}`,
    await mdxToLatex(source, {
      root: config.root,
      locale: config.locale,
      sourceFile,
      includeDeepDive: Boolean(config.includeDeepDive),
      workDir
    })
  ].join("\n\n");
}

function dayLatex(day: ArtifactBookDay, config: PdfEdition): string {
  const prefix = config.locale === "zh" ? `第 ${day.day} 日` : `Day ${day.day}`;
  return [
    "\\clearpage",
    `\\chapter{${latexEscape(prefix)}: ${latexEscape(day.title)}}`,
    day.summary ? `\\begin{leadbox}\n${latexEscape(day.summary)}\n\\end{leadbox}` : ""
  ].filter(Boolean).join("\n\n");
}

async function mdxToLatex(source: string, options: MdxLatexOptions): Promise<string> {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source) as MdxNode;
  const state: MdxRenderState = {
    ...options,
    sourceDir: path.dirname(options.sourceFile),
    imports: extractAssetImports(source, options.root, path.dirname(options.sourceFile)),
    constants: extractStringConstants(source)
  };
  return renderChildren(tree.children ?? [], state, { block: true }).replace(/\n{3,}/g, "\n\n").trim();
}

function renderNode(node: MdxNode, state: MdxRenderState, context: RenderContext = {}): string {
  switch (node.type) {
    case "root":
      return renderChildren(node.children ?? [], state, { ...context, block: true });
    case "mdxjsEsm":
    case "mdxFlowExpression":
    case "mdxTextExpression":
    case "html":
      return "";
    case "text":
      return latexEscape(node.value ?? "");
    case "break":
      return context.tableCell ? " " : "\\\\\n";
    case "paragraph":
      return renderParagraph(node, state, context);
    case "heading":
      return renderHeading(node, state);
    case "emphasis":
      return `\\emph{${renderInlineChildren(node, state, context)}}`;
    case "strong":
      return `\\textbf{${renderInlineChildren(node, state, context)}}`;
    case "delete":
      return renderInlineChildren(node, state, context);
    case "inlineCode":
      return `\\texttt{${latexEscape(node.value ?? "")}}`;
    case "code":
      return `\\begin{verbatim}\n${node.value ?? ""}\n\\end{verbatim}`;
    case "blockquote":
      return `\\begin{quotebox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{quotebox}`;
    case "list":
      return renderList(node, state);
    case "listItem":
      return renderChildren(node.children ?? [], state, { block: true, listItem: true }).trim();
    case "thematicBreak":
      return "\\begin{center}\\rule{0.32\\linewidth}{0.4pt}\\end{center}";
    case "link":
      return renderInlineChildren(node, state, context);
    case "image":
      return renderImage(node.url ?? "", latexEscape(node.value ?? ""), state);
    case "table":
      return renderMarkdownTable(node, state);
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return renderMdxElement(node, state, context);
    default:
      return renderChildren(node.children ?? [], state, context);
  }
}

function renderParagraph(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  const only = (node.children ?? []).filter((child) => child.type !== "mdxTextExpression");
  if (only.length === 1 && isBlockMdxElement(only[0])) {
    return renderNode(only[0], state, { ...context, block: true });
  }
  const rendered = renderInlineChildren(node, state, context).replace(/\s+\n/g, "\n").trim();
  return context.tableCell || context.listItem ? rendered : `${rendered}\n`;
}

function renderHeading(node: MdxNode, state: MdxRenderState): string {
  const text = renderInlineChildren(node, state, { heading: true });
  if (node.depth === 1) return `\\chapter*{${text}}\n\\addcontentsline{toc}{chapter}{${text}}`;
  if (node.depth === 2) return `\\section{${text}}`;
  if (node.depth === 3) return `\\subsection{${text}}`;
  return `\\paragraph{${text}}`;
}

function renderList(node: MdxNode, state: MdxRenderState): string {
  const env = node.ordered ? "enumerate" : "itemize";
  const items = (node.children ?? [])
    .map((child) => `\\item ${renderNode(child, state, { block: true, listItem: true }).trim()}`)
    .join("\n");
  return `\\begin{${env}}\n${items}\n\\end{${env}}`;
}

function renderMdxElement(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  const name = node.name ?? "";
  const attrs = mdxAttributes(node);

  if (!shouldRenderElement(name, attrs, state)) return "";

  if (name === "MathInline") return inlineMath(resolveExpression(attrs.get("latex"), state));
  if (name === "MathBlock") return blockMath(resolveExpression(attrs.get("latex"), state));
  if (name === "TipNote") return renderTipNote(attrs, state, context);
  if (name === "StatusChip") return renderStatusChip(attrs, state);
  if (name === "SimpleTable") return renderSimpleTable(attrs, state);
  if (name === "ImageFigure") {
    const src = resolveImageExpression(attrs.get("src"), state);
    const caption = renderChildren(node.children ?? [], state, { block: false }).trim();
    return renderImage(src, caption, state);
  }
  if (name === "table") return renderJsxTable(node, state);
  if (name === "br") return context.tableCell ? " " : "\\\\";
  if (name === "hr") return "\\begin{center}\\rule{0.32\\linewidth}{0.4pt}\\end{center}";

  if (["em", "i"].includes(name)) return `\\emph{${renderInlineChildren(node, state, context)}}`;
  if (["strong", "b"].includes(name)) return `\\textbf{${renderInlineChildren(node, state, context)}}`;
  if (name === "code") return `\\texttt{${renderInlineChildren(node, state, context)}}`;
  if (name === "sup") return `\\textsuperscript{${renderInlineChildren(node, state, context)}}`;
  if (name === "sub") return `\\textsubscript{${renderInlineChildren(node, state, context)}}`;
  if (name === "blockquote") {
    return `\\begin{quotebox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{quotebox}`;
  }
  if (["ul", "ol"].includes(name)) {
    return renderHtmlList(node, state, name === "ol");
  }
  if (name === "li") {
    return renderChildren(node.children ?? [], state, { block: true, listItem: true }).trim();
  }

  if (name === "Lead") return `\\begin{leadbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{leadbox}`;
  if (["Aside", "Panel", "Recap", "WhereBlock", "Formula", "Claim"].includes(name)) {
    return `\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "Sources") {
    return `\\begin{sourcesbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{sourcesbox}`;
  }
  if (["BlockTitle", "PanelTitle", "SourcesTitle"].includes(name)) {
    return `\\subsection*{${renderInlineChildren(node, state, { ...context, heading: true })}}`;
  }
  if (["SectionEyebrow", "HeroEyebrow", "Label", "Meta"].includes(name)) {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\eyebrow{${text}}` : "";
  }
  if (["HeroSubhead", "PanelNote", "Caption", "FigureCaption"].includes(name)) {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\begin{notepara}${text}\\end{notepara}` : "";
  }
  if (["Term", "Highlight"].includes(name)) return `\\emph{${renderInlineChildren(node, state, context)}}`;

  if (isContainerComponent(name) || isHtmlContainer(name)) {
    return renderChildren(node.children ?? [], state, { ...context, block: context.block || isFlowElement(node) });
  }

  if (node.children?.length) {
    return renderChildren(node.children, state, context);
  }

  return "";
}

function shouldRenderElement(name: string, attrs: Map<string, string | null>, state: MdxRenderState): boolean {
  if (name === "FormatOnly") {
    const media = attrs.get("media") ?? "";
    if (media === "web") return false;
    if (media === "deep-dive-print" || media === "deep-dive-epub") return state.includeDeepDive;
    return ["print", "pdf", "print-epub", "epub-print"].includes(media);
  }
  if (name === "FormatAlt") {
    const className = attrs.get("class") ?? "";
    if (/\bweb-only\b/.test(className)) return false;
    if (/\bprint-only\b|\bformat-alt\b/.test(className)) return true;
  }
  return true;
}

function renderTipNote(attrs: Map<string, string | null>, state: MdxRenderState, context: RenderContext): string {
  const text = resolveExpression(attrs.get("text"), state);
  if (context.heading || context.tableCell) return "";
  return text ? `\\footnote{${latexEscape(text)}}` : "";
}

function renderStatusChip(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const label = resolveExpression(attrs.get("printLabel"), state) || resolveExpression(attrs.get("label"), state);
  return label ? `\\statuschip{${latexEscape(label)}}` : "";
}

function renderSimpleTable(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const headers = parseStringArray(resolveExpression(attrs.get("headers"), state)).map(latexEscape);
  const rows = parseStringMatrix(resolveExpression(attrs.get("rows"), state)).map((row) => row.map(latexEscape));
  if (!headers.length || !rows.length) return "";
  return latexTable({ rows: [headers, ...rows], headerRows: new Set([0]) });
}

function renderMarkdownTable(node: MdxNode, state: MdxRenderState): string {
  const rows = (node.children ?? []).map((row) => {
    return (row.children ?? []).map((cell) => renderChildren(cell.children ?? [], state, { tableCell: true }).trim());
  }).filter((row) => row.length);
  return latexTable({ rows, headerRows: new Set(rows.length ? [0] : []) });
}

function renderJsxTable(node: MdxNode, state: MdxRenderState): string {
  const table: LatexTable = { rows: [], headerRows: new Set() };
  collectTableRows(node, state, table, false);
  return latexTable(table);
}

function collectTableRows(node: MdxNode, state: MdxRenderState, table: LatexTable, inHeader: boolean): void {
  const name = node.name ?? "";
  const header = inHeader || name === "thead";
  if (name === "tr") {
    const cells = (node.children ?? [])
      .filter((child) => ["td", "th"].includes(child.name ?? ""))
      .map((cell) => renderChildren(cell.children ?? [], state, { tableCell: true }).trim().replace(/\s+/g, " "));
    if (cells.length) {
      const index = table.rows.length;
      table.rows.push(cells);
      if (header || (node.children ?? []).some((child) => child.name === "th")) table.headerRows.add(index);
    }
    return;
  }
  for (const child of node.children ?? []) collectTableRows(child, state, table, header);
}

function latexTable(table: LatexTable): string {
  const columnCount = Math.max(1, ...table.rows.map((row) => row.length));
  const width = Math.min(0.9, 0.92 / columnCount).toFixed(2);
  const columns = Array.from({ length: columnCount }, () => `>{\\raggedright\\arraybackslash}p{${width}\\linewidth}`).join("");
  const lines = [`\\begin{small}`, `\\begin{longtable}{@{}${columns}@{}}`, "\\toprule"];
  for (const [index, row] of table.rows.entries()) {
    lines.push(row.map((cell) => cell || "\\strut").join(" & ") + " \\\\");
    if (table.headerRows.has(index)) lines.push("\\midrule");
  }
  lines.push("\\bottomrule", "\\end{longtable}", "\\end{small}");
  return lines.join("\n");
}

function renderHtmlList(node: MdxNode, state: MdxRenderState, ordered: boolean): string {
  const env = ordered ? "enumerate" : "itemize";
  const listItems = collectListItems(node);
  if (!listItems.length) {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  const items = listItems
    .map((child) => `\\item ${renderChildren(child.children ?? [], state, { block: true, listItem: true }).trim()}`)
    .join("\n");
  return `\\begin{${env}}\n${items}\n\\end{${env}}`;
}

function collectListItems(node: MdxNode): MdxNode[] {
  const items: MdxNode[] = [];
  for (const child of node.children ?? []) {
    if (child.name === "li") {
      items.push(child);
    } else if (!["ol", "ul"].includes(child.name ?? "")) {
      items.push(...collectListItems(child));
    }
  }
  return items;
}

function renderImage(src: string, caption: string, state: MdxRenderState): string {
  const filePath = prepareImagePath(src, state);
  if (!filePath) return caption ? `\\begin{notepara}${caption}\\end{notepara}` : "";
  const safePath = latexPath(filePath);
  const safeCaption = caption || "";
  return [
    "\\begin{center}",
    `\\includegraphics[width=0.92\\linewidth,height=0.34\\textheight,keepaspectratio]{${safePath}}`,
    safeCaption ? `\\\\{\\small\\color{descentMuted}${safeCaption}}` : "",
    "\\end{center}"
  ].filter(Boolean).join("\n");
}

function prepareImagePath(src: string, state: MdxRenderState): string | null {
  if (!src) return null;
  const rawPath = path.isAbsolute(src) ? src : path.resolve(state.sourceDir, src);
  if (!/\.(png|jpe?g|pdf)$/i.test(rawPath) && !/\.svg$/i.test(rawPath)) return null;
  if (!/\.svg$/i.test(rawPath)) return rawPath;
  const output = path.join(state.workDir, `${path.basename(rawPath, ".svg")}.pdf`);
  execFileSyncish("rsvg-convert", ["-f", "pdf", "-o", output, rawPath]);
  return output;
}

function renderChildren(children: MdxNode[], state: MdxRenderState, context: RenderContext): string {
  return children.map((child) => renderNode(child, state, context)).filter(Boolean).join(context.tableCell ? " " : "\n\n");
}

function renderInlineChildren(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  return renderChildren(node.children ?? [], state, { ...context, block: false }).replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
}

function blockMath(value: string): string {
  return value ? `\\[\n${value}\n\\]` : "";
}

function inlineMath(value: string): string {
  return value ? `\\(${value}\\)` : "";
}

function mdxAttributes(node: MdxNode): Map<string, string | null> {
  const attrs = new Map<string, string | null>();
  for (const attr of node.attributes ?? []) {
    if (attr.type !== "mdxJsxAttribute" || !attr.name) continue;
    if (typeof attr.value === "string" || attr.value === null) {
      attrs.set(attr.name, attr.value);
    } else {
      attrs.set(attr.name, attr.value?.value ?? "");
    }
  }
  return attrs;
}

function resolveExpression(value: string | null | undefined, state: MdxRenderState): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (state.constants.has(trimmed)) return state.constants.get(trimmed)!;
  const raw = trimmed.match(/^String\.raw`([\s\S]*)`$/);
  if (raw) return raw[1];
  const template = trimmed.match(/^`([\s\S]*)`$/);
  if (template) return template[1];
  const quoted = trimmed.match(/^["']([\s\S]*)["']$/);
  if (quoted) return quoted[1];
  return trimmed;
}

function resolveImageExpression(value: string | null | undefined, state: MdxRenderState): string {
  const expression = resolveExpression(value, state);
  const imported = expression.match(/^([A-Za-z_$][\w$]*)\.src$/);
  if (imported) return state.imports.get(imported[1]) ?? "";
  return expression;
}

function parseStringArray(value: string): string[] {
  const parsed = parseLiteral(value);
  return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
}

function parseStringMatrix(value: string): string[][] {
  const parsed = parseLiteral(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((row) => Array.isArray(row) ? row.map((item) => String(item)) : [String(row)]);
}

function parseLiteral(value: string): unknown {
  try {
    return Function(`"use strict"; return (${value});`)() as unknown;
  } catch {
    return null;
  }
}

function extractAssetImports(source: string, root: string, sourceDir: string): Map<string, string> {
  const imports = new Map<string, string>();
  const pattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+\.(?:png|jpe?g|svg|webp))["']/g;
  for (const match of source.matchAll(pattern)) {
    imports.set(match[1], resolveImportPath(match[2], root, sourceDir));
  }
  return imports;
}

function extractStringConstants(source: string): Map<string, string> {
  const constants = new Map<string, string>();
  const pattern = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*String\.raw`([\s\S]*?)`/g;
  for (const match of source.matchAll(pattern)) {
    constants.set(match[1], match[2]);
  }
  return constants;
}

function resolveImportPath(importPath: string, root: string, sourceDir: string): string {
  if (importPath.startsWith(".")) return path.resolve(sourceDir, importPath);
  if (importPath.startsWith("@assets/")) return path.join(root, "src/assets", importPath.slice("@assets/".length));
  return path.join(root, importPath);
}

function latexPreamble(config: PdfEdition): string {
  const cjkMain = config.locale === "zh" ? "Songti SC" : "Songti SC";
  return String.raw`\documentclass[10.5pt,openany]{book}
\usepackage[paperwidth=6in,paperheight=9in,top=0.74in,bottom=0.78in,inner=0.72in,outer=0.64in,headheight=14pt,headsep=11pt,footskip=26pt]{geometry}
\usepackage{fontspec}
\usepackage{xeCJK}
\setmainfont{Georgia}
\setsansfont{Hiragino Sans GB}
\setmonofont{Menlo}[Scale=0.82]
\setCJKmainfont{${cjkMain}}
\setCJKsansfont{Hiragino Sans GB}
\usepackage{microtype}
\usepackage{xcolor}
\usepackage{graphicx}
\usepackage{caption}
\usepackage{array}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage[most]{tcolorbox}
\usepackage{amsmath,amssymb}
\definecolor{descentTeal}{HTML}{13525A}
\definecolor{descentInk}{HTML}{1D2424}
\definecolor{descentMuted}{HTML}{667579}
\definecolor{descentPaper}{HTML}{FBF8F0}
\definecolor{descentLine}{HTML}{D7CCC0}
\color{descentInk}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.58em}
\setlist{itemsep=0.22em,topsep=0.35em,leftmargin=1.35em}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\sffamily\footnotesize\color{descentMuted}\thepage}
\fancyhead[LO]{\sffamily\footnotesize\color{descentMuted}${latexEscape(config.title)}}
\fancyhead[RE]{\sffamily\footnotesize\color{descentMuted}\leftmark}
\renewcommand{\headrulewidth}{0pt}
\titleformat{\chapter}[display]{\sffamily\bfseries\color{descentTeal}}{\Large\MakeUppercase{\chaptertitlename}\ \thechapter}{0.6em}{\Huge}
\titleformat{\section}{\sffamily\Large\bfseries\color{descentTeal}}{\thesection}{0.55em}{}
\titleformat{\subsection}{\sffamily\large\bfseries\color{descentInk}}{\thesubsection}{0.5em}{}
\newcommand{\eyebrow}[1]{\par\smallskip{\sffamily\footnotesize\bfseries\color{descentMuted}\MakeUppercase{#1}}\par\smallskip}
\newcommand{\statuschip}[1]{\textsf{\footnotesize\color{descentTeal}[#1]}}
\newenvironment{leadbox}{\begin{tcolorbox}[enhanced,breakable,colback=descentPaper,colframe=descentLine,boxrule=0.4pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]}{\end{tcolorbox}}
\newenvironment{lessonbox}{\begin{tcolorbox}[enhanced,breakable,colback=white,colframe=descentLine,boxrule=0.4pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]}{\end{tcolorbox}}
\newenvironment{sourcesbox}{\begin{tcolorbox}[enhanced,breakable,colback=descentPaper,colframe=descentLine,boxrule=0.3pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]\footnotesize}{\end{tcolorbox}}
\newenvironment{quotebox}{\begin{quote}\itshape}{\end{quote}}
\newenvironment{notepara}{\par\small\color{descentMuted}}{\par}
\captionsetup{font=small,labelformat=empty,textfont={color=descentMuted}}
\XeTeXlinebreaklocale "zh"
\XeTeXlinebreakskip = 0pt plus 1pt`;
}

function titlePageLatex(config: PdfEdition): string {
  return String.raw`\begin{titlepage}
\pagecolor{descentTeal}
\color{white}
\vspace*{0.52in}
{\sffamily\bfseries\fontsize{28}{32}\selectfont ${latexEscape(config.title)}\par}
\vspace{0.22in}
{\sffamily\fontsize{12}{16}\selectfont ${latexEscape(config.subtitle)}\par}
\vfill
{\sffamily\fontsize{9}{13}\selectfont ${latexEscape(config.authors)}\par}
{\sffamily\fontsize{8}{12}\selectfont ${latexEscape(config.language)}\par}
\end{titlepage}
\nopagecolor
\color{descentInk}`;
}

function latexEscape(value: string): string {
  return value
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("&", "\\&")
    .replaceAll("%", "\\%")
    .replaceAll("$", "\\$")
    .replaceAll("#", "\\#")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("~", "\\textasciitilde{}")
    .replaceAll("^", "\\textasciicircum{}");
}

function latexPath(value: string): string {
  return value.replaceAll("\\", "/").replaceAll(" ", "\\space ");
}

function dayBlock(day: ArtifactBookDay): string {
  return day.block;
}

function isBlockMdxElement(node: MdxNode): boolean {
  return ["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type) && [
    "SimpleTable",
    "ImageFigure",
    "MathBlock",
    "table",
    "Aside",
    "Panel",
    "Recap",
    "WhereBlock",
    "Formula",
    "Sources",
    "ContentSection",
    "Hero",
    "Wrap",
    "FormatAlt",
    "FormatOnly"
  ].includes(node.name ?? "");
}

function isFlowElement(node: MdxNode): boolean {
  return node.type === "mdxJsxFlowElement";
}

function isContainerComponent(name: string): boolean {
  return [
    "ContentSection",
    "Hero",
    "Wrap",
    "Threads",
    "Divider",
    "FormatAlt",
    "FormatOnly"
  ].includes(name);
}

function isHtmlContainer(name: string): boolean {
  return [
    "div",
    "span",
    "p",
    "figure",
    "figcaption",
    "section",
    "article",
    "thead",
    "tbody",
    "small"
  ].includes(name);
}

async function runXeLaTeX(texPath: string, workDir: string): Promise<void> {
  await execFileAsync("latexmk", [
    "-xelatex",
    "-interaction=nonstopmode",
    "-halt-on-error",
    "-file-line-error",
    path.basename(texPath)
  ], { cwd: workDir, maxBuffer: 1024 * 1024 * 12, timeout: 120000 });
}

function execFileSyncish(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: ["ignore", "pipe", "pipe"] });
}

function lastLatexLogLines(log: string): string {
  return log.split("\n").slice(-80).join("\n");
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
