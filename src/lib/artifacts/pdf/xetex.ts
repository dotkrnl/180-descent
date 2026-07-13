import { execFile, execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import * as cheerio from "cheerio";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { prepareLatinFonts, preparePdfFonts } from "@lib/assets/fonts";
import { loadArtifactBookDays, type ArtifactBookDay } from "@lib/artifacts/book";
import { bookArtifactName, dayArtifactName, downloadsDir } from "@lib/artifacts/downloads";
import {
  cleanDecorativePrefix,
  cleanEyebrowText,
  cleanFigureCaption,
  isDecorativeOnly,
  latexEscape,
  latexHrefEscape,
  latexPath,
  normalizeInlineLatex,
  romanNumeral,
  sanitizeAssetName,
  sanitizeBookmarkAnchor
} from "@lib/artifacts/pdf/latex";
import { latexPreamble, titlePageLatex } from "@lib/artifacts/pdf/template";
import { contentDayFile, contentDaysDir } from "@lib/content/paths";
import { readBookData, type BookData, type HumanEditorData } from "@lib/data/book";
import { readSyllabusBlockTitleMap } from "@lib/data/syllabus";
import { toError } from "@lib/errors";
import { isPathInside } from "@lib/fs/path";
import { PDF_BLOCK_COMPONENTS, PDF_TRANSPARENT_COMPONENTS } from "@lib/lesson/contracts";
import type { Locale } from "@lib/schemas/day";
import { siteDayDir } from "@lib/static-site/routes";

const execFileAsync = promisify(execFile);

interface BuildAllPdfsOptions {
  root: string;
}

interface PdfEdition {
  locale: Locale;
  title: string;
  subtitle: string;
  authors: string;
  humanEditor: HumanEditorData;
  description: string;
  siteUrl: string;
  publisher: string;
  language: string;
  output: string;
  includeDeepDive?: boolean;
  days?: ArtifactBookDay[];
  singleDay?: boolean;
}

export interface MdxLatexOptions {
  root: string;
  locale: Locale;
  sourceFile: string;
  includeDeepDive: boolean;
  workDir: string;
  siteUrl: string;
}

interface MdxRenderState {
  root: string;
  locale: Locale;
  sourceFile: string;
  sourceDir: string;
  includeDeepDive: boolean;
  workDir: string;
  siteUrl: string;
  imports: Map<string, string>;
  constants: Map<string, string>;
  renderedHtml: CheerioRoot | null;
  componentCounts: Map<string, number>;
  generatedAssetIndex: number;
  bookmarkIndex: number;
  pendingSectionEyebrow: string | null;
  pendingSectionNeedspace: string | null;
}

type CheerioRoot = ReturnType<typeof cheerio.load>;

interface RenderContext {
  block?: boolean;
  tableCell?: boolean;
  listItem?: boolean;
  heading?: boolean;
  sources?: boolean;
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

interface SvgAssetSpec {
  width?: string;
  height?: string;
}

interface SvgComponentSpec extends SvgAssetSpec {
  selector: string;
}

const TABLE_COMPONENTS = new Set(["table", "DataTable"]);
const TABLE_CELL_COMPONENTS = new Set(["td", "th", "DataTableCell", "DataTableHeader"]);
const TABLE_HEADER_COMPONENTS = new Set(["th", "DataTableHeader"]);
const LATEXMK_TIMEOUT_MS = Number(process.env.PDF_LATEXMK_TIMEOUT_MS ?? "300000");

export async function buildAllPdfs(options: BuildAllPdfsOptions): Promise<void> {
  const root = options.root;
  const book = await readBookData(root);

  await prepareLatinFonts({ root });
  await preparePdfFonts({ root });
  await mkdir(downloadsDir(root), { recursive: true });

  await buildPdf({
    root,
    locale: "en",
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors,
    humanEditor: book.humanEditor,
    description: book.description,
    siteUrl: book.siteUrl,
    publisher: book.publisher,
    language: book.language,
    output: bookArtifactName("pdf", "en", false)
  });

  await buildPdf({
    root,
    locale: "en",
    title: `${book.title}: Deep Dive`,
    subtitle: book.subtitle,
    authors: book.authors,
    humanEditor: book.humanEditor,
    description: book.description,
    siteUrl: book.siteUrl,
    publisher: book.publisher,
    language: book.language,
    output: bookArtifactName("pdf", "en", true),
    includeDeepDive: true
  });

  await buildPdf({
    root,
    locale: "zh",
    title: book.zh.title,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    humanEditor: book.zh.humanEditor,
    description: book.zh.description,
    siteUrl: book.siteUrl,
    publisher: book.publisher,
    language: book.zh.language,
    output: bookArtifactName("pdf", "zh", false)
  });

  await buildPdf({
    root,
    locale: "zh",
    title: `${book.zh.title}：专题深入版`,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    humanEditor: book.zh.humanEditor,
    description: book.zh.description,
    siteUrl: book.siteUrl,
    publisher: book.publisher,
    language: book.zh.language,
    output: bookArtifactName("pdf", "zh", true),
    includeDeepDive: true
  });

  await buildDayPdfs(root, "en", book);
  await buildDayPdfs(root, "zh", book);
}

async function buildDayPdfs(root: string, locale: Locale, book: BookData): Promise<void> {
  const days = await loadArtifactBookDays(root, locale);
  for (const day of days) {
    const zh = locale === "zh";
    const dayLabel = pdfDayLabel(day.day, locale);
    await buildPdf({
      root,
      locale,
      title: zh ? `${book.zh.title}：${dayLabel}` : `${book.title}: ${dayLabel}`,
      subtitle: day.title,
      authors: zh ? book.zh.authors : book.authors,
      humanEditor: zh ? book.zh.humanEditor : book.humanEditor,
      description: zh ? book.zh.description : book.description,
      siteUrl: book.siteUrl,
      publisher: book.publisher,
      language: zh ? book.zh.language : book.language,
      output: dayArtifactName("pdf", locale, day.path),
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

  try {
    const tex = await buildLatexDocument(config, workDir);
    await writeFile(texPath, tex);
    await runXeLaTeX(texPath, workDir);
    const log = await readFile(path.join(workDir, "book.log"), "utf8");
    const logIssues = latexLogIssues(log);
    if (logIssues.length) {
      throw new Error(`XeTeX log contains layout warnings:\n${logIssues.join("\n")}`);
    }

    await copyFile(outputPath, path.join(downloadsDir(root), config.output));
  } catch (error) {
    const log = await readFile(path.join(workDir, "book.log"), "utf8").catch(() => "");
    const keepNote = process.env.PDF_KEEP_TEMP === "1" ? `\n\nTemporary PDF build directory kept at ${workDir}` : "";
    const message = log ? `${toError(error).message}\n\n${lastLatexLogLines(log)}${keepNote}` : `${toError(error).message}${keepNote}`;
    throw new Error(`XeTeX PDF build failed for ${config.output}: ${message}`);
  } finally {
    if (process.env.PDF_KEEP_TEMP !== "1") {
      await rm(workDir, { recursive: true, force: true });
    }
  }
}

async function buildLatexDocument(config: PdfEdition & { root: string }, workDir: string): Promise<string> {
  const days = config.days ?? await loadArtifactBookDays(config.root, config.locale);
  const blockTitles = await localizedBlockTitles(config.root, config.locale);
  const chunks: string[] = [];

  if (!config.singleDay) {
    chunks.push(titlePageLatex(config));
    chunks.push("\\frontmatter\n\\tableofcontents\n\\mainmatter");
    chunks.push(await introductionLatex(config, workDir));
  } else {
    chunks.push("\\mainmatter");
  }

  let currentBlock = "";
  let blockNumber = 0;
  for (const day of days) {
    if (!config.singleDay && day.block !== currentBlock) {
      currentBlock = day.block;
      blockNumber++;
      chunks.push(blockDividerLatex(blockTitles.get(currentBlock) ?? currentBlock, blockNumber, config.locale));
    }
    chunks.push(dayLatex(day, blockTitles.get(day.block) ?? day.block, config));
    chunks.push(await mdxToLatex(day.bodySource, {
      root: config.root,
      locale: config.locale,
      sourceFile: contentDayFile(config.root, day.path, day.bodyPath),
      includeDeepDive: Boolean(config.includeDeepDive),
      workDir,
      siteUrl: config.siteUrl
    }));

    if (config.includeDeepDive) {
      for (const [appendixIndex, appendix] of day.appendices.entries()) {
        chunks.push(appendixDividerLatex(day, appendix.title, appendixIndex + 1, day.appendices.length, config));
        chunks.push("\\begin{appendixbody}");
        chunks.push(await mdxToLatex(appendix.bodySource, {
          root: config.root,
          locale: config.locale,
          sourceFile: contentDayFile(config.root, day.path, appendix.bodyPath),
          includeDeepDive: true,
          workDir,
          siteUrl: config.siteUrl
        }));
        chunks.push("\\end{appendixbody}\n\\clearpage");
        chunks.push("\\pagecolor{descentWhite}\n\\color{descentInk}\n\\fancyhead[L]{\\ttfamily\\scriptsize\\color{descentMuted}" + latexEscape(config.title) + "}");
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
    `\\markboth{${latexEscape(title)}}{${latexEscape(title)}}`,
    pdfBookmarkLatex(0, title, `introduction-${config.locale}`),
    `\\addcontentsline{toc}{chapter}{${latexEscape(title)}}`,
    "\\begin{pdfintro}",
    await mdxToLatex(source, {
      root: config.root,
      locale: config.locale,
      sourceFile,
      includeDeepDive: Boolean(config.includeDeepDive),
      workDir,
      siteUrl: config.siteUrl
    }),
    "\\end{pdfintro}"
  ].join("\n\n");
}

function dayLatex(day: ArtifactBookDay, blockTitle: string, config: PdfEdition): string {
  const prefix = pdfDayLabel(day.day, config.locale);
  const title = `${prefix}: ${day.title}`;
  return [
    "\\clearpage",
    dayDividerLatex(day, blockTitle, config),
    `\\chaptermark{${latexEscape(title)}}`,
    `\\addcontentsline{toc}{chapter}{${latexEscape(title)}}`
  ].filter(Boolean).join("\n\n");
}

function dayDividerLatex(day: ArtifactBookDay, blockTitle: string, config: PdfEdition): string {
  const label = config.locale === "zh"
    ? `模块 · ${blockTitle} · ${pdfDayLabel(day.day, config.locale)}`
    : `${blockTitle} · ${pdfDayLabel(day.day, config.locale)}`;
  const title = day.title;
  const summary = day.summary;
  const anchor = `day-${String(day.day).padStart(3, "0")}-${config.locale}`;
  return String.raw`\thispagestyle{empty}
${pdfBookmarkLatex(0, `${pdfDayLabel(day.day, config.locale)}: ${title}`, anchor)}
\pagecolor{descentAbyss}
\color{descentBone}
\begingroup
\newgeometry{margin=0in}
\vspace*{1.15in}
\noindent\makebox[0pt][l]{\hspace*{0.68in}
\begin{minipage}[t][5.85in][t]{4.55in}
{\ttfamily\fontsize{7.8}{10}\selectfont\addfontfeatures{LetterSpace=16}\color{descentAqua}\MakeUppercase{${latexEscape(label)}}\par}
\vspace{0.22in}
{\displayfont\fontsize{72}{72}\selectfont\color{descentAqua}${String(day.day).padStart(3, "0")}\par}
\vspace{-0.05in}
{\displayfont\bfseries\fontsize{28}{31}\selectfont\color{descentBone}${latexEscape(title)}\par}
\vspace{0.24in}
{\color{descentSignal}\rule{0.72in}{1.2pt}\par}
\vspace{0.20in}
{\displayfont\itshape\fontsize{12.5}{16}\selectfont\color{descentBoneMuted}${latexEscape(summary)}\par}
\vfill
{\ttfamily\fontsize{7.4}{9}\selectfont\addfontfeatures{LetterSpace=12}\color{descentBoneMuted}${config.locale === "zh" ? "研究路线 · 轻装版" : "RESEARCH ROUTE · READING EDITION"}\par}
\end{minipage}}
\endgroup
\restoregeometry
\clearpage
\pagecolor{descentWhite}
\color{descentInk}`;
}

function pdfBookmarkLatex(level: number, title: string, anchor: string): string {
  return pdfBookmarkEscapedLatex(level, latexEscape(title), anchor);
}

function pdfBookmarkEscapedLatex(level: number, escapedTitle: string, anchor: string): string {
  return `\\phantomsection\n\\pdfbookmark[${level}]{${escapedTitle}}{${sanitizeBookmarkAnchor(anchor)}}`;
}

function pdfDayLabel(day: number, locale: Locale): string {
  const padded = String(day).padStart(3, "0");
  return locale === "zh" ? `第 ${padded} 日` : `Day ${padded}`;
}

function blockDividerLatex(title: string, blockNumber: number, locale: Locale): string {
  const label = locale === "zh" ? `模块 ${romanNumeral(blockNumber)}` : `Block ${romanNumeral(blockNumber)}`;
  const tocLabel = `${label} · ${title}`;
  return String.raw`\clearpage
\addcontentsline{toc}{part}{${latexEscape(tocLabel)}}
\thispagestyle{empty}
\pagecolor{descentTeal}
\color{descentBone}
\begingroup
\newgeometry{margin=0in}
\vspace*{3.72in}
\noindent\makebox[0pt][l]{\hspace*{0.68in}
\begin{minipage}{4.55in}
{\ttfamily\fontsize{8.8}{11}\selectfont\addfontfeatures{LetterSpace=18}\MakeUppercase{${latexEscape(label)}}\par}
\vspace{0.18in}
{\displayfont\bfseries\fontsize{29}{31}\selectfont ${latexEscape(title)}\par}
\end{minipage}}
\endgroup
\restoregeometry
\clearpage
\pagecolor{descentWhite}
\color{descentInk}`;
}

function appendixDividerLatex(
  day: ArtifactBookDay,
  title: string,
  appendixIndex: number,
  appendixCount: number,
  config: PdfEdition
): string {
  const label = config.locale === "zh" ? "可选附录" : "Optional appendix";
  const folio = config.locale === "zh"
    ? `${pdfDayLabel(day.day, config.locale)} · ${appendixIndex}/${appendixCount}`
    : `${pdfDayLabel(day.day, config.locale)} · ${appendixIndex}/${appendixCount}`;
  const appendixTitle = `${label}: ${title}`;
  return String.raw`\clearpage
\thispagestyle{empty}
${pdfBookmarkLatex(1, appendixTitle, `appendix-${day.path}-${title}`)}
\pagecolor{descentTeal}
\color{descentBone}
\begingroup
\newgeometry{margin=0in}
\vspace*{2.65in}
\noindent\makebox[0pt][l]{\hspace*{0.68in}
\begin{minipage}{4.55in}
{\ttfamily\fontsize{7.8}{10}\selectfont\addfontfeatures{LetterSpace=16}\color{descentSignal}\MakeUppercase{${latexEscape(label)} · ${latexEscape(folio)}}\par}
\vspace{0.20in}
{\displayfont\bfseries\fontsize{27}{30}\selectfont\color{descentBone}${latexEscape(title)}\par}
\vspace{0.22in}
{\color{descentSignal}\rule{0.72in}{1.2pt}\par}
\vspace{0.18in}
{\ttfamily\fontsize{7.4}{9}\selectfont\addfontfeatures{LetterSpace=12}\color{descentBoneMuted}${config.locale === "zh" ? "正文之外 · 可选阅读" : "BEYOND THE MAIN TEXT · OPTIONAL READING"}\par}
\end{minipage}}
\endgroup
\restoregeometry
\clearpage
\pagecolor{descentCream}
\color{descentInk}
\fancyhead[L]{\ttfamily\scriptsize\color{descentTeal}${latexEscape(label)}}`;
}

async function localizedBlockTitles(root: string, locale: Locale): Promise<Map<string, string>> {
  return readSyllabusBlockTitleMap(root, locale);
}

export async function mdxToLatex(source: string, options: MdxLatexOptions): Promise<string> {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source) as MdxNode;
  const state: MdxRenderState = {
    ...options,
    sourceDir: path.dirname(options.sourceFile),
    imports: extractAssetImports(source, options.root, path.dirname(options.sourceFile)),
    constants: extractStringConstants(source),
    renderedHtml: await loadRenderedHtml(options.root, options.locale, options.sourceFile),
    componentCounts: new Map(),
    generatedAssetIndex: 0,
    bookmarkIndex: 0,
    pendingSectionEyebrow: null,
    pendingSectionNeedspace: null
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
      return renderCodeBlock(node.value ?? "");
    case "blockquote":
      return `\\begin{quotebox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{quotebox}`;
    case "list":
      return renderList(node, state, context);
    case "listItem":
      return renderChildren(node.children ?? [], state, { block: true, listItem: true }).trim();
    case "thematicBreak":
      return "\\begin{center}\\rule{0.32\\linewidth}{0.4pt}\\end{center}";
    case "link":
      return renderLink(node, state, context);
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
  const eyebrow = state.pendingSectionEyebrow;
  const needspace = state.pendingSectionNeedspace;
  state.pendingSectionEyebrow = null;
  state.pendingSectionNeedspace = null;
  const prefix = needspace ? `\\Needspace{${needspace}\\textheight}\n` : "";
  if (eyebrow && node.depth === 2) return `${prefix}\\sectionwithlabel{${eyebrow}}{${text}}`;
  if (eyebrow && node.depth === 3) return `${prefix}\\subsectionwithlabel{${eyebrow}}{${text}}`;
  if (node.depth === 1) return `\\pdfdaytitle{${text}}`;
  if (node.depth === 2) return `${prefix}\\section{${text}}`;
  if (node.depth === 3) return `${prefix}\\subsection{${text}}`;
  return `${prefix}\\blockheading{${text}}`;
}

function renderList(node: MdxNode, state: MdxRenderState, context: RenderContext = {}): string {
  const env = node.ordered ? "enumerate" : "itemize";
  const items = (node.children ?? [])
    .map((child) => {
      const item = `\\item ${renderNode(child, state, { block: true, listItem: true }).trim()}`;
      return context.sources ? `\\Needspace{5\\baselineskip}\n${item}` : item;
    })
    .join("\n");
  return `\\begin{${env}}\n${items}\n\\end{${env}}`;
}

function renderComponentItemize(node: MdxNode, state: MdxRenderState, itemName: string): string {
  const items = (node.children ?? [])
    .filter((child) => child.name === itemName)
    .map((child) => `\\item ${renderChildren(child.children ?? [], state, { block: true, listItem: true }).trim()}`)
    .join("\n");
  return items ? `\\begin{itemize}\n${items}\n\\end{itemize}` : "";
}

function renderCodeBlock(value: string): string {
  const lines = value.replace(/\s+$/g, "").split(/\r?\n/);
  const rendered = lines.map((line) => {
    const leading = line.match(/^ */)?.[0].length ?? 0;
    const body = latexEscape(line.slice(leading))
      .replaceAll("->", "\\textrightarrow{}")
      .replaceAll("<-", "\\textleftarrow{}");
    const indent = leading ? `\\hspace*{${(leading * 0.38).toFixed(2)}em}` : "";
    return `${indent}${body || "\\strut"}\\\\`;
  }).join("\n");
  return `\\begin{codebox}\n${rendered}\n\\end{codebox}`;
}

function renderComparePanel(node: MdxNode, state: MdxRenderState): string {
  const cards = (node.children ?? [])
    .filter((child) => child.name === "CompareCard")
    .map((card) => renderCompareCard(card, state));
  if (!cards.length) return "";
  const columns = cards.slice(0, 2).map((card) => [
    "\\begin{minipage}[t]{0.47\\linewidth}",
    card,
    "\\end{minipage}"
  ].join("\n"));
  return [
    "\\begin{comparebox}",
    columns.join("\\hfill\n"),
    "\\end{comparebox}"
  ].join("\n");
}

function renderCompareCard(node: MdxNode, state: MdxRenderState): string {
  let title = "";
  let meta = "";
  let items: string[] = [];
  const children = (node.children ?? []).flatMap((child) => {
    return child.type === "paragraph" ? child.children ?? [] : [child];
  });
  for (const child of children) {
    const childName = child.name ?? "";
    if (childName === "CompareCardTitle") {
      title = renderInlineChildren(child, state, { heading: true }).trim();
      continue;
    }
    if (childName === "CompareCardMeta") {
      meta = renderInlineChildren(child, state, { heading: true }).trim();
      continue;
    }
    if (["ul", "CompareList"].includes(childName)) {
      items = collectListItems(child)
        .map((item) => renderListItemBody(item, state))
        .filter(Boolean);
    }
  }
  return [
    title ? `{\\displayfont\\large\\bfseries\\color{descentInk}${title}\\par}` : "",
    meta ? `{\\ttfamily\\footnotesize\\color{descentMuted}${meta}\\par}` : "",
    items.length ? `\\begin{itemize}[leftmargin=1em,itemsep=0.16em,topsep=0.34em]\n${items.map((item) => `\\item ${item}`).join("\n")}\n\\end{itemize}` : ""
  ].filter(Boolean).join("\n");
}

function renderMdxElement(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  const name = node.name ?? "";
  const attrs = mdxAttributes(node);

  if (!shouldRenderElement(name, attrs, state)) return "";
  if (name === "FormatOnly" && isPdfPageBreak(attrs)) return "\\clearpage";
  if (name === "FormatOnly" && attrs.get("variant") === "alternate" && nodeContainsLargeBlock(node)) {
    return `\\Needspace{0.44\\textheight}\n${renderChildren(node.children ?? [], state, { block: true })}`;
  }

  if (name === "MathInline") return inlineMath(resolveExpression(attrs.get("latex"), state));
  if (name === "MathBlock") return blockMath(resolveExpression(attrs.get("latex"), state));
  if (name === "TipNote") return renderTipNote(attrs, state, context);
  if (name === "StatusChip") return renderStatusChip(attrs, state);
  if (name === "StatusText") return renderStatusText(attrs, state);
  if (name === "SimpleTable") return renderSimpleTable(attrs, state);
  if (name === "BayesSieve") return renderBayesSieve(node, attrs, state);
  if (name === "MathLine") return renderMathLine(node, state);
  if (name === "MathLineLabel") return renderInlineChildren(node, state, context);
  if (name === "ProbabilityCamps") return renderChildren(node.children ?? [], state, { block: true });
  if (name === "ProbabilityCamp") return renderProbabilityCamp(node, attrs, state);
  if (name === "BlockQuote") {
    return `\\begin{quotebox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{quotebox}`;
  }
  const renderedSvg = renderRenderedSvgComponent(name, attrs, state);
  if (renderedSvg) return renderedSvg;
  if (name === "svg") return renderInlineSvg(node, state);
  if (name === "ImageFigure") {
    const src = resolveImageExpression(attrs.get("src"), state);
    const caption = renderChildren(node.children ?? [], state, { block: false }).trim();
    return renderImage(src, caption, state);
  }
  if (isTableComponent(name)) return renderJsxTable(node, state);
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
  if (name === "p") {
    if (/\b(label|h)\b/.test(attrs.get("class") ?? "")) {
      const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }).trim());
      return text ? `\\eyebrow{${text}}` : "";
    }
    const text = renderInlineChildren(node, state, context).trim();
    return context.tableCell || context.listItem ? text : `${text}\n`;
  }
  if (/^h[1-6]$/.test(name)) {
    const depth = Number(name.slice(1));
    const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }).trim());
    if (!text) return "";
    if (depth === 1) return `\\pdfdaytitle{${text}}`;
    if (depth === 2) return `\\section{${text}}`;
    return `\\blockheading{${text}}`;
  }
  if (name === "span") {
    const text = renderInlineChildren(node, state, context);
    return isDecorativeOnly(text) ? "" : text;
  }

  if (name === "Lead") return renderLead(node, attrs, state);
  if (name === "ClaimHeader") return renderClaimHeader(node, attrs, state);
  if (name === "ContinueNote") {
    const label = cleanDecorativePrefix(attrs.get("label") ?? "");
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [
      label ? `\\eyebrow{${latexEscape(label)}}` : "",
      body
    ].filter(Boolean).join("\n");
  }
  if (["AppendixCardGrid", "AppendixCard"].includes(name)) {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "AppendixCardTitle") {
    const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }).trim());
    return text ? `\\blockheading{${text}}` : "";
  }
  if (name === "AppendixCardMeta") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `{\\ttfamily\\footnotesize\\color{descentMuted}${text}\\par}` : "";
  }
  if (name === "AppendixTimelineList") {
    return renderComponentItemize(node, state, "MilestoneItem");
  }
  if (name === "MilestoneList") {
    return renderComponentItemize(node, state, "MilestoneItem");
  }
  if (name === "MilestoneDate") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `{\\ttfamily\\footnotesize\\color{descentMuted}${text}}\\quad ` : "";
  }
  if (name === "LogicSchools") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "LogicSchool") {
    const title = latexEscape(attrs.get("title") ?? "");
    const tag = latexEscape(attrs.get("tag") ?? "");
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [
      title ? `\\blockheading{${title}}` : "",
      tag ? `{\\ttfamily\\footnotesize\\color{descentMuted}${tag}\\par}` : "",
      body
    ].filter(Boolean).join("\n");
  }
  if (name === "EscapeGrid") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "EscapeCard") {
    const who = latexEscape(attrs.get("who") ?? "");
    const move = latexEscape(attrs.get("move") ?? "");
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [
      who ? `\\blockheading{${who}}` : "",
      move ? `{\\ttfamily\\footnotesize\\color{descentMuted}${move}\\par}` : "",
      body
    ].filter(Boolean).join("\n");
  }
  if (name === "TheoryKey") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "TheoryCard") {
    const who = latexEscape(attrs.get("who") ?? "");
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [
      who ? `{\\ttfamily\\footnotesize\\color{descentMuted}${who}\\par}` : "",
      body
    ].filter(Boolean).join("\n");
  }
  if (name === "TheoryCardLead") {
    return `\\textbf{${renderInlineChildren(node, state, context)}}`;
  }
  if (name === "MiniList") {
    const items = (node.children ?? [])
      .filter((child) => child.name === "MiniListItem")
      .map((child) => {
        const marker = latexEscape(mdxAttributes(child).get("marker") ?? "");
        const body = renderChildren(child.children ?? [], state, { block: true, listItem: true }).trim();
        return `\\item${marker ? `[\\texttt{${marker}}]` : ""} ${body}`;
      })
      .join("\n");
    return items ? `\\begin{itemize}\n${items}\n\\end{itemize}` : "";
  }
  if (name === "MiniListItem") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "MaturityTimeline") {
    const items = (node.children ?? [])
      .filter((child) => child.name === "MaturityTimelineItem")
      .map((child) => {
        const childAttrs = mdxAttributes(child);
        const year = latexEscape(childAttrs.get("year") ?? "");
        const title = latexEscape(childAttrs.get("title") ?? "");
        const status = statusChipLatex(childAttrs.get("status") ?? "", childAttrs.get("status") ?? "");
        const body = renderChildren(child.children ?? [], state, { block: true, listItem: true }).trim();
        const label = [year, title].filter(Boolean).join(" · ");
        return `\\item ${status}${status ? "\\enspace " : ""}${label ? `\\textbf{${label}}. ` : ""}${body}`;
      })
      .join("\n");
    return items ? `\\begin{itemize}\n${items}\n\\end{itemize}` : "";
  }
  if (name === "MaturityTimelineItem") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "TrilemmaKey") {
    return renderComponentItemize(node, state, "TrilemmaKeyItem");
  }
  if (name === "TrilemmaKeyItem") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "Roadmap") {
    const title = latexEscape(resolveExpression(attrs.get("title"), state));
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [title ? `\\blockheading{${title}}` : "", body].filter(Boolean).join("\n");
  }
  if (name === "DefinitionBox") {
    const title = cleanDecorativePrefix(latexEscape(resolveExpression(attrs.get("title"), state)));
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    return [title ? `\\eyebrow{${title}}` : "", body].filter(Boolean).join("\n");
  }
  if (name === "AppendixFigure") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "AppendixNote") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\begin{notepara}${text}\\end{notepara}` : "";
  }
  if (name === "LessonList") {
    return renderHtmlList({ ...node, name: "ul" }, state, false);
  }
  if (name === "DekGrid") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "MisconceptionList") {
    return renderHtmlList({ ...node, name: "ul" }, state, false);
  }
  if (name === "MisconceptionFix") {
    const text = renderInlineChildren(node, state, context);
    return text ? ` ${text}` : "";
  }
  if (name === "LessonNote") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\begin{notepara}${text}\\end{notepara}` : "";
  }
  if (["AppendixTimeline", "AppendixTimelineItem"].includes(name)) {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "AppendixTimelineYear" || name === "AppendixTimelineCitation") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `{\\ttfamily\\footnotesize\\color{descentMuted}${text}\\par}` : "";
  }
  if (name === "AppendixTimelineTitle") {
    const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }).trim());
    return text ? `\\blockheading{${text}}` : "";
  }
  if (name === "AppendixTimelineBody") {
    const text = renderInlineChildren(node, state, context).trim();
    return text ? `${text}\n` : "";
  }
  if (name === "ComparePanel") return renderComparePanel(node, state);
  if (name === "BridgeLabel") {
    const text = cleanEyebrowText(renderInlineChildren(node, state, { ...context, heading: true }));
    return text ? `\\begin{center}{\\ttfamily\\footnotesize\\color{descentMuted}\\MakeUppercase{${text}}}\\end{center}` : "";
  }
  if (name === "HybridBox") {
    return `\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "Panel") {
    const needspace = nodeContainsLargeBlock(node) ? "0.72\\textheight" : "0.38\\textheight";
    return `\\Needspace{${needspace}}\n\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "WhereBlock") {
    return `\\Needspace{0.30\\textheight}\n\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "Recap") {
    return `\\Needspace{0.36\\textheight}\n\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (["Aside", "Formula"].includes(name)) {
    return `\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "Sources") {
    return `\\begin{sourcesbox}\n${renderChildren(node.children ?? [], state, { block: true, sources: true })}\n\\end{sourcesbox}`;
  }
  if (name === "SourcesTitle") {
    const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }));
    return text ? `${pdfBookmarkEscapedLatex(1, text, `sources-${sourceLabel(state)}-${++state.bookmarkIndex}`)}\n\\subsection*{${text}}` : "";
  }
  if (["BlockTitle", "PanelTitle"].includes(name)) {
    const text = cleanDecorativePrefix(renderInlineChildren(node, state, { ...context, heading: true }));
    return text ? `\\subsection*{${text}}` : "";
  }
  if (name === "SectionEyebrow") {
    const text = cleanEyebrowText(renderEyebrowText(node, attrs, state, context));
    const needspace = attrs.get("pdfNeedspace")?.trim() ?? "";
    if (needspace && !/^(?:0?\.\d+|1(?:\.0+)?)$/.test(needspace)) {
      throw new Error(`Invalid SectionEyebrow pdfNeedspace "${needspace}" in ${sourceLabel(state)}`);
    }
    state.pendingSectionEyebrow = text || null;
    state.pendingSectionNeedspace = needspace || null;
    return "";
  }
  if (["HeroEyebrow", "Label", "HybridTitle"].includes(name)) {
    const text = cleanEyebrowText(renderEyebrowText(node, attrs, state, context));
    return text ? `\\eyebrow{${text}}` : "";
  }
  if (name === "Meta") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `{\\ttfamily\\footnotesize\\color{descentTeal}${text}}` : "";
  }
  if (name === "QuoteSource") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\n{\\ttfamily\\footnotesize\\color{descentMuted}${text}}` : "";
  }
  if (name === "RecapList") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "RecapItem") {
    const term = latexEscape(resolveExpression(attrs.get("term"), state));
    const body = renderChildren(node.children ?? [], state, { block: true }).trim();
    if (!body) return "";
    return term ? `\\blockheading{${term}}\n${body}\n` : `${body}\n`;
  }
  if (name === "FigureBox") {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  if (name === "FigureBoxCaption") {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\begin{notepara}${text}\\end{notepara}` : "";
  }
  if (["HeroSubhead", "PanelNote", "Caption", "SourceNote", "LadderKey"].includes(name)) {
    const text = renderInlineChildren(node, state, { ...context, heading: true }).trim();
    return text ? `\\begin{notepara}${text}\\end{notepara}` : "";
  }
  if (name === "Strong") return `\\textbf{${renderInlineChildren(node, state, context)}}`;
  if (["Term", "Highlight"].includes(name)) return `\\emph{${renderInlineChildren(node, state, context)}}`;

  if (isContainerComponent(name) || isHtmlContainer(name)) {
    return renderChildren(node.children ?? [], state, { ...context, block: context.block || isFlowElement(node) });
  }

  if (node.children?.length) {
    return renderChildren(node.children, state, context);
  }

  return "";
}

function nodeContainsLargeBlock(node: MdxNode): boolean {
  if (node.type === "table" || isTableComponent(node.name ?? "")) return true;
  if (SVG_COMPONENTS.has(node.name ?? "")) return true;
  return (node.children ?? []).some(nodeContainsLargeBlock);
}

export function shouldRenderPdfFormatOnly(media: string, includeDeepDive: boolean): boolean {
  if (media === "deep-dive-print") return includeDeepDive;
  if (media === "deep-dive-epub") return false;
  return ["print", "pdf", "print-epub", "epub-print"].includes(media);
}

function shouldRenderElement(name: string, attrs: Map<string, string | null>, state: MdxRenderState): boolean {
  if (name === "FormatOnly") {
    return shouldRenderPdfFormatOnly(attrs.get("media") ?? "", state.includeDeepDive);
  }
  return true;
}

function isPdfPageBreak(attrs: Map<string, string | null>): boolean {
  return /\bpdf-page-break\b/.test(attrs.get("class") ?? "");
}

function renderTipNote(attrs: Map<string, string | null>, state: MdxRenderState, context: RenderContext): string {
  const text = resolveExpression(attrs.get("text"), state);
  if (context.heading || context.tableCell) return "";
  return text ? `\\footnote{${latexEscape(text)}}` : "";
}

function renderStatusChip(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const label = resolveExpression(attrs.get("printLabel"), state) || resolveExpression(attrs.get("label"), state);
  const status = resolveExpression(attrs.get("status"), state);
  return label ? statusChipLatex(label, status) : "";
}

function renderStatusText(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const label = resolveExpression(attrs.get("label"), state);
  const status = resolveExpression(attrs.get("status"), state);
  if (!label) return "";
  const color = status === "bad" ? "descentBad" : status === "hint" ? "descentHint" : "descentTeal";
  return `{\\ttfamily\\footnotesize\\bfseries\\color{${color}}[${latexEscape(label)}]}`;
}

function renderLead(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const drop = latexEscape(attrs.get("drop") ?? "");
  const body = renderChildren(node.children ?? [], state, { block: true }).trim();
  if (!body) return "";
  return drop ? `\\leadpara{${drop}}{${body}}` : `\\leadparanodrop{${body}}`;
}

function renderClaimHeader(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const label = cleanEyebrowText(resolveExpression(attrs.get("label"), state));
  const chips = (node.children ?? [])
    .filter((child) => (child.name ?? "") === "StatusChip")
    .map((child) => renderStatusChip(mdxAttributes(child), state))
    .filter(Boolean)
    .join("\\enspace ");

  if (label && chips) return `\\claimtop{${label}}{${chips}}`;
  if (label) return `\\claimtop{${label}}{}`;
  return chips;
}

function statusChipLatex(label: string, status: string): string {
  const command = status === "bad" ? "statuschipbad" : status === "hint" ? "statuschiphint" : "statuschipok";
  return `\\${command}{${latexEscape(label)}}`;
}

function renderSimpleTable(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const headers = parseStringArray(resolveExpression(attrs.get("headers"), state), "SimpleTable headers").map(latexEscape);
  const rows = parseStringMatrix(resolveExpression(attrs.get("rows"), state), "SimpleTable rows").map((row) => row.map(latexEscape));
  const roomy = /\brealism-table\b/.test(attrs.get("class") ?? "");
  if (!headers.length) throw new Error(`SimpleTable headers must not be empty in ${sourceLabel(state)}`);
  if (!rows.length) throw new Error(`SimpleTable rows must not be empty in ${sourceLabel(state)}`);
  if (rows.some((row) => !row.length)) throw new Error(`SimpleTable rows must not contain empty rows in ${sourceLabel(state)}`);
  if (rows.some((row) => row.length !== headers.length)) throw new Error(`SimpleTable row widths must match headers in ${sourceLabel(state)}`);
  return latexTable({ rows: [headers, ...rows], headerRows: new Set([0]) }, { roomy });
}

function renderBayesSieve(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const title = latexEscape(resolveExpression(attrs.get("title"), state));
  const subtitle = renderSlot(node, state, "subtitle", { block: false });
  const equation = renderSlot(node, state, "equation", { block: true });
  const table = renderSlot(node, state, "table", { block: true });
  const total = renderSlot(node, state, "total", { block: false });
  return [
    title ? `\\blockheading{${title}}` : "",
    subtitle ? `\\begin{notepara}${subtitle}\\end{notepara}` : "",
    equation,
    table,
    total ? `\\begin{notepara}${total}\\end{notepara}` : ""
  ].filter(Boolean).join("\n");
}

function renderMathLine(node: MdxNode, state: MdxRenderState): string {
  const formula = renderSlot(node, state, "formula", { block: true });
  const explanation = renderChildren(
    (node.children ?? []).filter((child) => mdxAttributes(child).get("slot") !== "formula"),
    state,
    { block: false }
  ).trim();
  return [formula, explanation ? `\\begin{notepara}${explanation}\\end{notepara}` : ""].filter(Boolean).join("\n");
}

function renderProbabilityCamp(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const heading = latexEscape(resolveExpression(attrs.get("heading"), state));
  const subhead = latexEscape(resolveExpression(attrs.get("subhead"), state));
  const body = renderChildren(node.children ?? [], state, { block: true }).trim();
  return [
    heading ? `\\blockheading{${heading}}` : "",
    subhead ? `\\begin{notepara}${subhead}\\end{notepara}` : "",
    body
  ].filter(Boolean).join("\n");
}

const SVG_COMPONENTS = new Map<string, SvgComponentSpec>([
  ["StoppedClockFigure", { selector: ".hero-clock", width: "0.42\\linewidth", height: "0.24\\textheight" }],
  ["SunriseInductionFigure", { selector: ".hero-sun", width: "0.82\\linewidth", height: "0.28\\textheight" }],
  ["InferenceModesFigure", { selector: ".hero-art", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["InformationQuestionTree", { selector: ".hero-fig", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["InformationPhysicsFrontierMap", { selector: ".information-physics-frontier-map", width: "0.86\\linewidth", height: "0.3\\textheight" }],
  ["ZeteticNormTensionFigure", { selector: ".zetetic-norm-tension-figure", width: "0.82\\linewidth", height: "0.24\\textheight" }],
  ["KnowledgeBeforeBeliefTimeline", { selector: ".knowledge-before-belief-timeline", width: "0.82\\linewidth", height: "0.2\\textheight" }],
  ["EpistemicBackstopFigure", { selector: ".epistemic-backstop-figure", width: "0.82\\linewidth", height: "0.22\\textheight" }],
  ["LarissaRoadFigure", { selector: ".larissa-road-figure", width: "0.72\\linewidth", height: "0.2\\textheight" }],
  ["KindsOfKnowingTree", { selector: ".kinds-of-knowing-tree", width: "0.82\\linewidth", height: "0.24\\textheight" }],
  ["TheoryLadenSunriseFigure", { selector: ".theory-laden-sunrise-figure", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["QuineWebFigure", { selector: ".quine-web-figure", width: "0.58\\linewidth", height: "0.28\\textheight" }],
  ["MathBenchmarkLadderFigure", { selector: ".math-benchmark-ladder-figure", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["SquareOfOppositionFigure", { selector: ".square-of-opposition-figure", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["ComputationalCapacityLadderFigure", { selector: ".computational-capacity-ladder-figure", width: "0.86\\linewidth", height: "0.3\\textheight" }],
  ["ForkingPathsFigure", { selector: ".forking-paths", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["CausationScatterFigure", { selector: ".hero-fig", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["EmergenceHero", { selector: ".emergence-hero", width: "0.86\\linewidth", height: "0.30\\textheight" }],
  ["ComplexityHump", { selector: ".complexity-hump", width: "0.82\\linewidth", height: "0.26\\textheight" }],
  ["Day8StaticFigure", { selector: ".day8-static-figure", width: "0.86\\linewidth", height: "0.24\\textheight" }],
  ["Day9StaticFigure", { selector: ".day9-static-figure", width: "0.86\\linewidth", height: "0.26\\textheight" }],
  ["Day10TwinFlow", { selector: ".day10-twin-flow-pdf", width: "0.96\\linewidth", height: "0.32\\textheight" }],
  ["Day10ParadigmLadder", { selector: ".day10-paradigm-ladder-pdf", width: "0.96\\linewidth", height: "0.34\\textheight" }],
  ["Day10StaticFigure", { selector: ".day10-static-figure", width: "0.86\\linewidth", height: "0.26\\textheight" }],
  ["Day11StaticFigure", { selector: ".day11-static-figure", width: "0.86\\linewidth", height: "0.26\\textheight" }],
  ["Day12StaticFigure", { selector: ".day12-static-figure", width: "0.92\\linewidth", height: "0.3\\textheight" }]
]);

function renderRenderedSvgComponent(name: string, attrs: Map<string, string | null>, state: MdxRenderState): string {
  let spec = SVG_COMPONENTS.get(name);
  if (name === "Day8StaticFigure") {
    const kind = resolveExpression(attrs.get("kind"), state).trim();
    if (kind) {
      spec = {
        selector: `.day8-static-figure-${kind}`,
        width: "0.86\\linewidth",
        height: "0.24\\textheight"
      };
    }
  }
  if (name === "Day9StaticFigure") {
    const kind = resolveExpression(attrs.get("kind"), state).trim();
    if (kind) {
      const day9Width = kind === "thresholds" || kind === "timeline" ? "0.98\\linewidth" : kind === "tipping-types" ? "0.9\\linewidth" : "0.86\\linewidth";
      const day9Height = kind === "thresholds"
        ? "0.5\\textheight"
        : kind === "timeline"
          ? "0.34\\textheight"
          : kind === "tipping-types"
            ? "0.46\\textheight"
          : kind === "thermostat" || kind === "deep-loops" || kind === "cliff" || kind === "governor"
            ? "0.22\\textheight"
            : "0.28\\textheight";
      spec = {
        selector: `.day9-static-figure-${kind}`,
        width: day9Width,
        height: day9Height
      };
    }
  }
  if (name === "Day10StaticFigure") {
    const kind = resolveExpression(attrs.get("kind"), state).trim();
    if (kind) {
      const day10Width = kind === "weather-chart" || kind === "frontier-map" || kind === "extrapolation-cliff"
        ? "0.98\\linewidth"
        : kind === "levins-triangle"
          ? "0.92\\linewidth"
        : "0.86\\linewidth";
      const day10Height = kind === "frontier-map"
        ? "0.42\\textheight"
        : kind === "levins-triangle"
          ? "0.36\\textheight"
        : kind === "extrapolation-cliff"
          ? "0.34\\textheight"
        : kind === "weather-chart"
          ? "0.36\\textheight"
          : "0.26\\textheight";
      spec = {
        selector: `.day10-static-figure-${kind}`,
        width: day10Width,
        height: day10Height
      };
    }
  }
  if (name === "Day11StaticFigure") {
    const kind = resolveExpression(attrs.get("kind"), state).trim();
    if (kind) {
      const day11Width = kind === "frequency-grid" || kind === "resource-curve" || kind === "prospect-value" || kind === "bias-noise-darts" || kind === "clockwork" || kind === "sampling-curve" ? "0.98\\linewidth" : "0.86\\linewidth";
      const day11Height = kind === "resource-curve"
        ? "0.34\\textheight"
        : kind === "frequency-grid"
          ? "0.32\\textheight"
          : kind === "prospect-value"
            ? "0.34\\textheight"
            : kind === "bias-noise-darts"
              ? "0.32\\textheight"
              : kind === "clockwork"
                ? "0.32\\textheight"
              : kind === "sampling-curve"
                ? "0.34\\textheight"
          : kind === "scissors"
            ? "0.30\\textheight"
            : "0.26\\textheight";
      spec = {
        selector: `.day11-static-figure-${kind}`,
        width: day11Width,
        height: day11Height
      };
    }
  }
  if (name === "Day12StaticFigure") {
    const kind = resolveExpression(attrs.get("kind"), state).trim();
    if (kind) {
      const wideKinds = new Set([
        "degree-distribution",
        "contagion",
        "robustness",
        "centrality",
        "synchronization",
        "tipping-cascade"
      ]);
      const tallKinds = new Set(["hyperbolic", "tipping-cascade"]);
      spec = {
        selector: ".day12-static-figure-" + kind,
        width: wideKinds.has(kind) ? "0.98\\linewidth" : "0.9\\linewidth",
        height: tallKinds.has(kind) ? "0.38\\textheight" : "0.32\\textheight"
      };
    }
  }
  if (!spec) return "";
  if (!state.renderedHtml) {
    throw new Error(`Rendered HTML is required to render PDF figure ${name} in ${sourceLabel(state)}`);
  }

  const index = state.componentCounts.get(spec.selector) ?? 0;
  state.componentCounts.set(spec.selector, index + 1);

  const rootElement = state.renderedHtml(spec.selector).eq(index);
  if (!rootElement.length) {
    throw new Error(`Missing rendered PDF figure ${name} (${spec.selector}) in ${sourceLabel(state)}`);
  }

  const svgElements = rootElement.find("svg");
  if (svgElements.length !== 1) {
    throw new Error(`Expected one rendered PDF figure SVG for ${name} (${spec.selector}) in ${sourceLabel(state)}, found ${svgElements.length}`);
  }

  const svg = state.renderedHtml.xml(svgElements.first());
  const caption = latexEscape(
    resolveExpression(attrs.get("tag"), state)
    || rootElement.find("figcaption,.figcap,.stopped-tag,.sun-tag,.doors-tag").first().text().trim()
  );
  return renderSvgAsset(svg, caption, state, name, spec);
}

function renderSvgAsset(svg: string, caption: string, state: MdxRenderState, name: string, spec: SvgAssetSpec): string {
  if (!svg.trim()) throw new Error(`PDF SVG asset is empty for ${name} in ${sourceLabel(state)}`);
  const sourceSlug = sanitizeAssetName(path.relative(contentDaysDir(state.root), state.sourceFile));
  const assetSlug = sanitizeAssetName(`${sourceSlug}-${name}-${++state.generatedAssetIndex}`);
  const svgPath = path.join(state.workDir, `${assetSlug}.svg`);
  const pdfPath = path.join(state.workDir, `${assetSlug}.pdf`);

  writeFileSync(svgPath, prepareSvgForRsvg(svg), "utf8");
  execFileSyncish("rsvg-convert", ["-f", "pdf", "-o", pdfPath, svgPath]);

  return [
    "\\Needspace{0.4\\textheight}",
    "\\vspace{0.12in}",
    "\\begin{center}",
    `\\includegraphics[width=${spec.width ?? "0.78\\linewidth"},height=${spec.height ?? "0.28\\textheight"},keepaspectratio]{${latexPath(pdfPath)}}`,
    caption ? `\\\\[0.06in]{\\small\\color{descentMuted}${cleanFigureCaption(caption)}}` : "",
    "\\end{center}",
    "\\vspace{0.1in}"
  ].filter(Boolean).join("\n");
}

function sourceLabel(state: MdxRenderState): string {
  return path.relative(state.root, state.sourceFile);
}

function renderInlineSvg(node: MdxNode, state: MdxRenderState): string {
  const svg = serializeSvgNode(node);
  return renderSvgAsset(svg, "", state, "InlineSvg", {
    width: "0.9\\linewidth",
    height: "0.34\\textheight"
  });
}

function serializeSvgNode(node: MdxNode): string {
  if (node.type === "text") return xmlEscape(node.value ?? "");
  const name = node.name ?? "";
  if (!name) return (node.children ?? []).map(serializeSvgNode).join("");

  const attrs = (node.attributes ?? [])
    .filter((attr) => attr.type === "mdxJsxAttribute" && attr.name)
    .map((attr) => {
      const value = typeof attr.value === "string"
        ? attr.value
        : attr.value && typeof attr.value === "object"
          ? attr.value.value ?? ""
          : "";
      return ` ${attr.name}="${xmlEscape(value)}"`;
    })
    .join("");
  return `<${name}${attrs}>${(node.children ?? []).map(serializeSvgNode).join("")}</${name}>`;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function prepareSvgForRsvg(svg: string): string {
  let prepared = svg
    .replace(/color-mix\(in srgb,\s*(var\(--[^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s+\d+%,\s*transparent\)/g, "$1")
    .replace(/var\(--([^,)]+)(?:,\s*([^)]+))?\)/g, (_, name: string, fallback?: string) => {
      const value = SVG_COLOR_VARS.get(name.trim()) ?? fallback?.trim() ?? "#1d2424";
      return value;
    });
  if (!/\sxmlns=/.test(prepared)) {
    prepared = prepared.replace("<svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"");
  }
  return prepared;
}

const SVG_COLOR_VARS = new Map<string, string>([
  ["paper", "#f5f3ec"],
  ["raised", "#fbfaf5"],
  ["ink", "#172530"],
  ["ink-soft", "#41545d"],
  ["ink-faint", "#5d6c72"],
  ["line", "#ddd7c8"],
  ["line-strong", "#cabfa8"],
  ["accent", "#1d6f78"],
  ["accent-deep", "#13525a"],
  ["brass", "#93651f"],
  ["ok", "#2a704a"],
  ["hint", "#845a1b"],
  ["contested", "#a23c34"],
  ["heat", "#a8442d"],
  ["paper-deep", "#ebe4d4"]
]);

function renderMarkdownTable(node: MdxNode, state: MdxRenderState): string {
  const rows = (node.children ?? []).map((row) => {
    return (row.children ?? []).map((cell) => renderChildren(cell.children ?? [], state, { tableCell: true }).trim());
  }).filter((row) => row.length);
  if (!rows.length) throw new Error(`Markdown table must contain at least one row in ${sourceLabel(state)}`);
  return latexTable({ rows, headerRows: new Set(rows.length ? [0] : []) });
}

function renderJsxTable(node: MdxNode, state: MdxRenderState): string {
  const table: LatexTable = { rows: [], headerRows: new Set() };
  collectTableRows(node, state, table, false);
  if (!table.rows.length) throw new Error(`DataTable must contain at least one row in ${sourceLabel(state)}`);
  return latexTable(table);
}

function collectTableRows(node: MdxNode, state: MdxRenderState, table: LatexTable, inHeader: boolean): void {
  const name = node.name ?? "";
  const header = inHeader || name === "thead" || name === "DataTableHead";
  if (name === "tr" || name === "DataTableRow") {
    const rowCells = (node.children ?? []).map(unwrapTableCell).filter((cell): cell is MdxNode => Boolean(cell));
    const cells = rowCells
      .map((cell) => renderChildren(cell.children ?? [], state, { tableCell: true }).trim().replace(/\s+/g, " "));
    if (cells.length) {
      const index = table.rows.length;
      table.rows.push(cells);
      if (header || rowCells.every((cell) => isTableHeaderComponent(cell.name ?? ""))) table.headerRows.add(index);
    }
    return;
  }
  for (const child of node.children ?? []) collectTableRows(child, state, table, header);
}

function unwrapTableCell(node: MdxNode): MdxNode | null {
  if (isTableCellComponent(node.name ?? "")) return node;
  const children = node.children ?? [];
  if (node.type === "paragraph" && children.length === 1 && isTableCellComponent(children[0].name ?? "")) return children[0];
  return null;
}

function isTableComponent(name: string): boolean {
  return TABLE_COMPONENTS.has(name);
}

function isTableCellComponent(name: string): boolean {
  return TABLE_CELL_COMPONENTS.has(name);
}

function isTableHeaderComponent(name: string): boolean {
  return TABLE_HEADER_COMPONENTS.has(name);
}

function latexTable(table: LatexTable, options: { roomy?: boolean } = {}): string {
  const columnCount = Math.max(1, ...table.rows.map((row) => row.length));
  const usableWidth = options.roomy
    ? columnCount >= 4 ? 0.86 : 0.9
    : columnCount >= 5 ? 0.9 : columnCount === 4 ? 0.92 : 0.94;
  const width = Math.min(0.94, usableWidth / columnCount).toFixed(3);
  const size = columnCount >= 5 ? "\\scriptsize" : "\\footnotesize";
  const columns = Array.from({ length: columnCount }, () => `>{\\raggedright\\arraybackslash}p{${width}\\linewidth}`).join("");
  const lines = [
    "\\Needspace{12\\baselineskip}",
    "\\begingroup",
    size,
    `\\setlength{\\tabcolsep}{${options.roomy ? "4pt" : "3pt"}}`,
    `\\renewcommand{\\arraystretch}{${options.roomy ? "1.34" : "1.22"}}`,
    "\\arrayrulecolor{descentLine}",
    "\\sloppy",
    `\\begin{longtable}{@{}${columns}@{}}`,
  ];
  let startIndex = 0;
  if (table.headerRows.has(0)) {
    const header = latexTableRow(table.rows[0], true);
    lines.push(header, "\\hline", "\\endfirsthead", header, "\\hline", "\\endhead");
    startIndex = 1;
  }
  for (const [offset, row] of table.rows.slice(startIndex).entries()) {
    const index = offset + startIndex;
    const isHeader = table.headerRows.has(index);
    lines.push(latexTableRow(row, isHeader));
    lines.push("\\hline");
  }
  lines.push("\\end{longtable}", "\\endgroup");
  return lines.join("\n");
}

function latexTableRow(row: string[], isHeader: boolean): string {
  const cells = row.map((cell) => {
    const content = cell || "\\strut";
    return isHeader ? `\\tablehead{${content}}` : content;
  });
  return cells.join(" & ") + " \\\\";
}

function renderHtmlList(node: MdxNode, state: MdxRenderState, ordered: boolean): string {
  const env = ordered ? "enumerate" : "itemize";
  const listItems = collectListItems(node);
  if (!listItems.length) {
    return renderChildren(node.children ?? [], state, { block: true });
  }
  const items = listItems
    .map((child) => `\\item ${renderListItemBody(child, state)}`)
    .join("\n");
  return `\\begin{${env}}\n${items}\n\\end{${env}}`;
}

function collectListItems(node: MdxNode): MdxNode[] {
  const items: MdxNode[] = [];
  for (const child of node.children ?? []) {
    if (["li", "LessonListItem", "MisconceptionItem"].includes(child.name ?? "")) {
      items.push(child);
    } else if (!["ol", "ul"].includes(child.name ?? "")) {
      items.push(...collectListItems(child));
    }
  }
  return items;
}

function renderListItemBody(node: MdxNode, state: MdxRenderState): string {
  const attrs = mdxAttributes(node);
  const lead = resolveExpression(attrs.get("lead"), state);
  const body = renderChildren(node.children ?? [], state, { block: true, listItem: true }).trim();
  return lead ? `\\textbf{${latexEscape(lead)}} ${body}`.trim() : body;
}

function renderImage(src: string, caption: string, state: MdxRenderState): string {
  const filePath = prepareImagePath(src, state);
  const safePath = latexPath(filePath);
  const safeCaption = caption || "";
  return [
    "\\Needspace{0.42\\textheight}",
    "\\vspace{0.14in}",
    "\\begin{center}",
    `\\includegraphics[width=0.86\\linewidth,height=0.3\\textheight,keepaspectratio]{${safePath}}`,
    safeCaption ? `\\\\[0.06in]{\\small\\color{descentMuted}${safeCaption}}` : "",
    "\\end{center}",
    "\\vspace{0.12in}"
  ].filter(Boolean).join("\n");
}

function prepareImagePath(src: string, state: MdxRenderState): string {
  if (!src) throw new Error("PDF image source is empty");
  const rawPath = path.isAbsolute(src) ? src : path.resolve(state.sourceDir, src);
  if (!/\.(png|jpe?g|pdf)$/i.test(rawPath) && !/\.svg$/i.test(rawPath)) {
    throw new Error(`Unsupported PDF image asset type: ${src}`);
  }
  if (!/\.svg$/i.test(rawPath)) return rawPath;
  const output = path.join(state.workDir, `${path.basename(rawPath, ".svg")}.pdf`);
  execFileSyncish("rsvg-convert", ["-f", "pdf", "-o", output, rawPath]);
  return output;
}

function renderChildren(children: MdxNode[], state: MdxRenderState, context: RenderContext): string {
  const rendered: string[] = [];
  for (const child of children) {
    if (state.pendingSectionEyebrow && child.type !== "heading") {
      rendered.push(`\\sectioneyebrow{${state.pendingSectionEyebrow}}`);
      state.pendingSectionEyebrow = null;
    }
    const value = renderNode(child, state, context);
    if (value) rendered.push(value);
  }
  if (state.pendingSectionEyebrow && context.block) {
    rendered.push(`\\sectioneyebrow{${state.pendingSectionEyebrow}}`);
    state.pendingSectionEyebrow = null;
  }
  return rendered.join(context.tableCell || context.listItem ? " " : "\n\n");
}

function renderSlot(node: MdxNode, state: MdxRenderState, slot: string, context: RenderContext): string {
  return renderChildren(
    (node.children ?? []).filter((child) => mdxAttributes(child).get("slot") === slot),
    state,
    context
  ).trim();
}

function renderInlineChildren(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  return normalizeInlineLatex(
    (node.children ?? [])
      .map((child) => renderNode(child, state, { ...context, block: false }))
      .join("")
      .replace(/\n+/g, " ")
  );
}

function renderEyebrowText(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState, context: RenderContext): string {
  return [
    attrs.get("number") ?? "",
    renderInlineChildren(node, state, { ...context, heading: true }).trim()
  ].filter(Boolean).join(" ");
}

function blockMath(value: string): string {
  return value ? `\\[\n${value}\n\\]` : "";
}

function inlineMath(value: string): string {
  if (!value) return "";
  return `\\(${value}\\)`;
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
  const constant = state.constants.get(trimmed);
  if (constant !== undefined) return constant;
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

function parseStringArray(value: string, label: string): string[] {
  const parsed = parseLiteral(value, label);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be a literal string array`);
  }
  return parsed;
}

function parseStringMatrix(value: string, label: string): string[][] {
  const parsed = parseLiteral(value, label);
  if (
    !Array.isArray(parsed) ||
    parsed.some((row) => !Array.isArray(row) || row.some((item) => typeof item !== "string"))
  ) {
    throw new Error(`${label} must be a literal string matrix`);
  }
  return parsed;
}

function parseLiteral(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${toError(error).message}`);
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

async function loadRenderedHtml(root: string, locale: Locale, sourceFile: string): Promise<CheerioRoot | null> {
  const contentRoot = contentDaysDir(root);
  if (!isPathInside(contentRoot, sourceFile)) return null;
  const relativeSource = path.relative(contentRoot, sourceFile);

  const [dayPath] = relativeSource.split(path.sep);
  if (!dayPath) return null;

  const htmlPath = path.join(siteDayDir(root, locale), dayPath, "index.html");
  const html = await readFile(htmlPath, "utf8");
  return cheerio.load(html);
}

function renderLink(node: MdxNode, state: MdxRenderState, context: RenderContext): string {
  const text = renderInlineChildren(node, state, context) || latexEscape(node.url ?? "");
  const href = normalizePdfHref(node.url ?? "", state);
  if (!href) return text;
  return `\\href{${latexHrefEscape(href)}}{${text}}`;
}

function normalizePdfHref(href: string, state: MdxRenderState): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return "";
  if (/^(?:https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${state.siteUrl}${trimmed}`;
  return "";
}

function isBlockMdxElement(node: MdxNode): boolean {
  return ["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type)
    && PDF_BLOCK_COMPONENTS.has(node.name ?? "");
}

function isFlowElement(node: MdxNode): boolean {
  return node.type === "mdxJsxFlowElement";
}

function isContainerComponent(name: string): boolean {
  return PDF_TRANSPARENT_COMPONENTS.has(name);
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
  ], { cwd: workDir, maxBuffer: 1024 * 1024 * 12, timeout: LATEXMK_TIMEOUT_MS });
}

function execFileSyncish(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: ["ignore", "pipe", "pipe"] });
}

function lastLatexLogLines(log: string): string {
  return log.split("\n").slice(-80).join("\n");
}

export function latexLogIssues(log: string): string[] {
  const issues: string[] = [];
  const patterns = [
    /Overfull \\[hv]box .*$/gm,
    /Underfull \\[hv]box .*$/gm,
    /Missing character: .*$/gm,
    /^.*Warning: .*$/gm
  ];

  for (const pattern of patterns) {
    for (const match of log.matchAll(pattern)) {
      issues.push(match[0].trim());
      if (issues.length >= 20) return issues;
    }
  }

  return issues;
}
