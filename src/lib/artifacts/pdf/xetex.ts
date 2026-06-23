import { execFile, execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import * as cheerio from "cheerio";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import YAML from "yaml";
import { prepareLatinFonts, preparePdfFonts } from "@lib/assets";
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
  translators?: string;
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
  renderedHtml: CheerioRoot | null;
  componentCounts: Map<string, number>;
  generatedAssetIndex: number;
  pendingSectionEyebrow: string | null;
}

type CheerioRoot = ReturnType<typeof cheerio.load>;

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

interface SvgComponentSpec {
  selector: string;
  width?: string;
  height?: string;
}

type LocalizedValue = string | Record<Locale, string | undefined>;

interface SyllabusData {
  blocks?: Array<{
    title?: LocalizedValue;
  }>;
}

export async function buildAllPdfs(options: BuildAllPdfsOptions): Promise<void> {
  const root = options.root;
  const book = YAML.parse(await readFile(path.join(root, "src/_data/book.yaml"), "utf8")) as BookData;

  await prepareLatinFonts({ root });
  await preparePdfFonts({ root });
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
    translators: book.zh.translators,
    language: book.zh.language,
    output: "180-descent-zh.pdf"
  });

  await buildPdf({
    root,
    locale: "zh",
    title: `${book.zh.title}：专题深入版`,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    translators: book.zh.translators,
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
      translators: zh ? book.zh.translators : undefined,
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
  const blockTitles = config.singleDay ? new Map<string, string>() : await localizedBlockTitles(config.root, config.locale);
  const chunks: string[] = [];

  chunks.push(titlePageLatex(config));
  if (!config.singleDay) {
    chunks.push("\\frontmatter\n\\tableofcontents\n\\mainmatter");
    chunks.push(await introductionLatex(config, workDir));
  } else {
    chunks.push("\\mainmatter");
  }

  let currentBlock = "";
  let blockNumber = 0;
  for (const day of days) {
    if (!config.singleDay && dayBlock(day) !== currentBlock) {
      currentBlock = dayBlock(day);
      blockNumber++;
      chunks.push(blockDividerLatex(blockTitles.get(currentBlock) ?? currentBlock, blockNumber, config.locale));
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
        chunks.push(`\\clearpage\n\\section*{${latexEscape(label)}: ${latexEscape(title)}}`);
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
    `\\markboth{${latexEscape(title)}}{${latexEscape(title)}}`,
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
    `\\chaptermark{${latexEscape(prefix)}: ${latexEscape(day.title)}}`,
    `\\addcontentsline{toc}{chapter}{${latexEscape(prefix)}: ${latexEscape(day.title)}}`
  ].filter(Boolean).join("\n\n");
}

function blockDividerLatex(title: string, blockNumber: number, locale: Locale): string {
  const label = locale === "zh" ? `模块 ${romanNumeral(blockNumber)}` : `Block ${romanNumeral(blockNumber)}`;
  const tocLabel = `${label} · ${title}`;
  return String.raw`\clearpage
\addcontentsline{toc}{part}{${latexEscape(tocLabel)}}
\thispagestyle{empty}
\pagecolor{descentTeal}
\color{white}
\begingroup
\newgeometry{margin=0in}
\vspace*{3.72in}
\hspace*{0.68in}
\begin{minipage}{4.55in}
{\ttfamily\fontsize{8.8}{11}\selectfont\addfontfeatures{LetterSpace=18}\MakeUppercase{${latexEscape(label)}}\par}
\vspace{0.18in}
{\displayfont\bfseries\fontsize{29}{31}\selectfont ${latexEscape(title)}\par}
\end{minipage}
\restoregeometry
\endgroup
\clearpage
\nopagecolor
\color{descentInk}`;
}

async function localizedBlockTitles(root: string, locale: Locale): Promise<Map<string, string>> {
  const syllabus = YAML.parse(await readFile(path.join(root, "src/_data/syllabus-data.yaml"), "utf8")) as SyllabusData;
  const titles = new Map<string, string>();
  for (const block of syllabus.blocks ?? []) {
    const title = block.title;
    const en = localizedString(title, "en");
    const localized = localizedString(title, locale);
    if (en && localized) titles.set(en, localized);
  }
  return titles;
}

function localizedString(value: LocalizedValue | undefined, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? "";
}

async function mdxToLatex(source: string, options: MdxLatexOptions): Promise<string> {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source) as MdxNode;
  const state: MdxRenderState = {
    ...options,
    sourceDir: path.dirname(options.sourceFile),
    imports: extractAssetImports(source, options.root, path.dirname(options.sourceFile)),
    constants: extractStringConstants(source),
    renderedHtml: await loadRenderedHtml(options.root, options.locale, options.sourceFile),
    componentCounts: new Map(),
    generatedAssetIndex: 0,
    pendingSectionEyebrow: null
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
  const eyebrow = state.pendingSectionEyebrow;
  state.pendingSectionEyebrow = null;
  if (eyebrow && node.depth === 2) return `\\sectionwithlabel{${eyebrow}}{${text}}`;
  if (eyebrow && node.depth === 3) return `\\subsectionwithlabel{${eyebrow}}{${text}}`;
  if (node.depth === 1) return `\\pdfdaytitle{${text}}`;
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
  const renderedSvg = renderRenderedSvgComponent(name, attrs, state);
  if (renderedSvg) return renderedSvg;
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
  if (name === "span") {
    return renderInlineChildren(node, state, context);
  }

  if (name === "Lead") return renderLead(node, attrs, state);
  if (name === "div" && /\bctop\b/.test(attrs.get("class") ?? "")) return renderClaimTop(node, state);
  if (["Aside", "Panel", "Recap", "WhereBlock", "Formula", "Claim"].includes(name)) {
    return `\\begin{lessonbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{lessonbox}`;
  }
  if (name === "Sources") {
    return `\\begin{sourcesbox}\n${renderChildren(node.children ?? [], state, { block: true })}\n\\end{sourcesbox}`;
  }
  if (["BlockTitle", "PanelTitle", "SourcesTitle"].includes(name)) {
    return `\\subsection*{${renderInlineChildren(node, state, { ...context, heading: true })}}`;
  }
  if (name === "SectionEyebrow") {
    const text = cleanEyebrowText(renderEyebrowText(node, attrs, state, context));
    state.pendingSectionEyebrow = text || null;
    return "";
  }
  if (["HeroEyebrow", "Label", "Meta"].includes(name)) {
    const text = cleanEyebrowText(renderEyebrowText(node, attrs, state, context));
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
  const status = resolveExpression(attrs.get("status"), state);
  return label ? statusChipLatex(label, status) : "";
}

function renderLead(node: MdxNode, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const drop = latexEscape(attrs.get("drop") ?? "");
  const body = renderChildren(node.children ?? [], state, { block: true }).trim();
  if (!body) return "";
  return drop ? `\\leadpara{${drop}}{${body}}` : `\\leadparanodrop{${body}}`;
}

function renderClaimTop(node: MdxNode, state: MdxRenderState): string {
  const labelParts: string[] = [];
  const chips: string[] = [];

  for (const child of node.children ?? []) {
    const childName = child.name ?? "";
    const attrs = mdxAttributes(child);
    if (childName === "StatusChip") {
      const label = resolveExpression(attrs.get("printLabel"), state) || resolveExpression(attrs.get("label"), state);
      const status = resolveExpression(attrs.get("status"), state);
      if (label) chips.push(statusChipLatex(label, status));
      continue;
    }
    const text = renderInlineChildren(child, state, { heading: true }).trim();
    if (text) labelParts.push(text);
  }

  const label = cleanEyebrowText(labelParts.join(" "));
  const chipText = chips.join("\\enspace ");
  if (label && chipText) return `\\claimtop{${label}}{${chipText}}`;
  if (label) return `\\claimtop{${label}}{}`;
  return chipText;
}

function statusChipLatex(label: string, status: string): string {
  const command = status === "bad" ? "statuschipbad" : status === "hint" ? "statuschiphint" : "statuschipok";
  return `\\${command}{${latexEscape(label)}}`;
}

function renderSimpleTable(attrs: Map<string, string | null>, state: MdxRenderState): string {
  const headers = parseStringArray(resolveExpression(attrs.get("headers"), state)).map(latexEscape);
  const rows = parseStringMatrix(resolveExpression(attrs.get("rows"), state)).map((row) => row.map(latexEscape));
  if (!headers.length || !rows.length) return "";
  return latexTable({ rows: [headers, ...rows], headerRows: new Set([0]) });
}

const SVG_COMPONENTS = new Map<string, SvgComponentSpec>([
  ["StoppedClockFigure", { selector: ".hero-clock", width: "0.42\\linewidth", height: "0.24\\textheight" }],
  ["SunriseInductionFigure", { selector: ".hero-sun", width: "0.82\\linewidth", height: "0.28\\textheight" }],
  ["InferenceModesFigure", { selector: ".hero-art", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["InformationQuestionTree", { selector: ".hero-fig", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["ForkingPathsFigure", { selector: ".forking-paths", width: "0.82\\linewidth", height: "0.3\\textheight" }],
  ["CausationScatterFigure", { selector: ".hero-fig", width: "0.82\\linewidth", height: "0.3\\textheight" }]
]);

function renderRenderedSvgComponent(name: string, attrs: Map<string, string | null>, state: MdxRenderState): string {
  const spec = SVG_COMPONENTS.get(name);
  if (!spec || !state.renderedHtml) return "";

  const index = state.componentCounts.get(spec.selector) ?? 0;
  state.componentCounts.set(spec.selector, index + 1);

  const rootElement = state.renderedHtml(spec.selector).eq(index);
  if (!rootElement.length) return "";

  const svgElements = rootElement.find("svg");
  if (svgElements.length !== 1) return "";

  const svg = state.renderedHtml.xml(svgElements.first());
  const caption = latexEscape(
    resolveExpression(attrs.get("tag"), state)
    || rootElement.find("figcaption,.figcap,.stopped-tag,.sun-tag,.doors-tag").first().text().trim()
  );
  return renderSvgAsset(svg, caption, state, name, spec);
}

function renderSvgAsset(svg: string, caption: string, state: MdxRenderState, name: string, spec: SvgComponentSpec): string {
  if (!svg.trim()) return "";
  const sourceSlug = sanitizeAssetName(path.relative(path.join(state.root, "src/content/days"), state.sourceFile));
  const assetSlug = sanitizeAssetName(`${sourceSlug}-${name}-${++state.generatedAssetIndex}`);
  const svgPath = path.join(state.workDir, `${assetSlug}.svg`);
  const pdfPath = path.join(state.workDir, `${assetSlug}.pdf`);

  writeFileSync(svgPath, prepareSvgForRsvg(svg), "utf8");
  execFileSyncish("rsvg-convert", ["-f", "pdf", "-o", pdfPath, svgPath]);

  return [
    "\\Needspace{0.36\\textheight}",
    "\\begin{center}",
    `\\includegraphics[width=${spec.width ?? "0.82\\linewidth"},height=${spec.height ?? "0.3\\textheight"},keepaspectratio]{${latexPath(pdfPath)}}`,
    caption ? `\\\\{\\small\\color{descentMuted}${cleanFigureCaption(caption)}}` : "",
    "\\end{center}"
  ].filter(Boolean).join("\n");
}

function prepareSvgForRsvg(svg: string): string {
  let prepared = svg
    .replace(/color-mix\(in srgb,\s*(var\(--[^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s+\d+%,\s*transparent\)/g, "$1")
    .replace(/var\(--([^)]+)\)/g, (_, name: string) => SVG_COLOR_VARS.get(name.trim()) ?? "#1d2424");
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
  const usableWidth = columnCount >= 5 ? 0.82 : columnCount === 4 ? 0.86 : 0.9;
  const width = Math.min(0.9, usableWidth / columnCount).toFixed(3);
  const size = columnCount >= 5 ? "\\scriptsize" : "\\footnotesize";
  const columns = Array.from({ length: columnCount }, () => `>{\\raggedright\\arraybackslash}p{${width}\\linewidth}`).join("");
  const lines = [
    "\\begingroup",
    size,
    "\\setlength{\\tabcolsep}{2.5pt}",
    "\\renewcommand{\\arraystretch}{1.12}",
    "\\sloppy",
    `\\begin{longtable}{@{}${columns}@{}}`,
    "\\toprule"
  ];
  for (const [index, row] of table.rows.entries()) {
    lines.push(row.map((cell) => cell || "\\strut").join(" & ") + " \\\\");
    if (table.headerRows.has(index)) lines.push("\\midrule");
  }
  lines.push("\\bottomrule", "\\end{longtable}", "\\endgroup");
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
    "\\Needspace{0.38\\textheight}",
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
  return rendered.join(context.tableCell ? " " : "\n\n");
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
  return value ? `\\mbox{\\(${value}\\)}` : "";
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

async function loadRenderedHtml(root: string, locale: Locale, sourceFile: string): Promise<CheerioRoot | null> {
  const contentRoot = path.join(root, "src/content/days");
  const relativeSource = path.relative(contentRoot, sourceFile);
  if (relativeSource.startsWith("..")) return null;

  const [dayPath] = relativeSource.split(path.sep);
  if (!dayPath) return null;

  const htmlPath = locale === "zh"
    ? path.join(root, "_site/zh/days", dayPath, "index.html")
    : path.join(root, "_site/days", dayPath, "index.html");
  const html = await readFile(htmlPath, "utf8").catch(() => "");
  return html ? cheerio.load(html) : null;
}

function latexPreamble(config: PdfEdition & { root: string }): string {
  const fontPath = latexPath(path.join(config.root, "src/assets/fonts/pdf") + path.sep);
  const cjkMain = config.locale === "zh" ? "LXGW WenKai" : "Songti SC";
  return String.raw`\documentclass[10.5pt,openany,oneside]{book}
\let\cleardoublepage\clearpage
\usepackage[paperwidth=6in,paperheight=9in,top=0.72in,bottom=0.78in,inner=0.55in,outer=0.55in,headheight=14pt,headsep=11pt,footskip=26pt]{geometry}
\usepackage{fontspec}
\usepackage{xeCJK}
\defaultfontfeatures{Ligatures=TeX}
\setmainfont[
  Path=${fontPath},
  UprightFont=newsreader-latin-400-normal.otf,
  ItalicFont=newsreader-latin-400-italic.otf,
  BoldFont=newsreader-latin-700-normal.otf,
  BoldItalicFont=newsreader-latin-700-italic.otf
]{Newsreader}
\newfontfamily\displayfont[
  Path=${fontPath},
  UprightFont=fraunces-latin-600-normal.otf,
  ItalicFont=fraunces-latin-400-italic.otf,
  BoldFont=fraunces-latin-700-normal.otf,
  BoldItalicFont=fraunces-latin-700-italic.otf
]{Fraunces}
\setmonofont[
  Path=${fontPath},
  UprightFont=ibm-plex-mono-latin-400-normal.otf,
  BoldFont=ibm-plex-mono-latin-600-normal.otf,
  Scale=0.82
]{IBM Plex Mono}
\setsansfont{Hiragino Sans GB}
\IfFontExistsTF{${cjkMain}}{\setCJKmainfont{${cjkMain}}}{\setCJKmainfont{Songti SC}}
\setCJKsansfont{Hiragino Sans GB}
\usepackage{microtype}
\usepackage{xcolor}
\usepackage{graphicx}
\usepackage{tikz}
\usepackage{caption}
\usepackage{array}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{tocloft}
\usepackage{needspace}
\usepackage{lettrine}
\usepackage[most]{tcolorbox}
\usepackage{amsmath,amssymb}
\definecolor{descentTeal}{HTML}{13525A}
\definecolor{descentInk}{HTML}{1D2424}
\definecolor{descentMuted}{HTML}{667579}
\definecolor{descentPaper}{HTML}{FBF8F0}
\definecolor{descentCream}{HTML}{F7F3EA}
\definecolor{descentLine}{HTML}{D7CCC0}
\definecolor{descentOk}{HTML}{2A704A}
\definecolor{descentHint}{HTML}{845A1B}
\definecolor{descentBad}{HTML}{A23C34}
\color{descentInk}
\raggedbottom
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.5em}
\exhyphenpenalty=10000
\setlist{itemsep=0.18em,topsep=0.32em,leftmargin=1.25em}
\setcounter{tocdepth}{0}
\setcounter{secnumdepth}{0}
\renewcommand{\contentsname}{${config.locale === "zh" ? "目录" : "Contents"}}
\renewcommand{\cfttoctitlefont}{\displayfont\Huge\bfseries\color{descentTeal}}
\renewcommand{\cftpartfont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftpartpagefont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftchapfont}{\normalfont}
\renewcommand{\cftchappagefont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftchapleader}{\cftdotfill{\cftdotsep}}
\setlength{\cftbeforepartskip}{0.62em}
\setlength{\cftbeforechapskip}{0.2em}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\ttfamily\scriptsize\color{descentMuted}\thepage}
\fancyhead[LO]{\ttfamily\scriptsize\color{descentMuted}${latexEscape(config.title)}}
\fancyhead[RE]{\ttfamily\scriptsize\color{descentMuted}\leftmark}
\renewcommand{\headrulewidth}{0pt}
\titleformat{\chapter}[display]{\displayfont\bfseries\color{descentTeal}}{}{0pt}{\Huge}
\titlespacing*{\chapter}{0pt}{0pt}{0.22in}
\titleformat{\section}{\displayfont\Large\bfseries\color{descentTeal}}{\thesection}{0.55em}{}
\titleformat{\subsection}{\displayfont\large\bfseries\color{descentInk}}{\thesubsection}{0.5em}{}
\newcommand{\pdfdaytitle}[1]{{\displayfont\bfseries\fontsize{23}{25}\selectfont #1\par}\vspace{0.04in}}
\newcommand{\eyebrow}[1]{\Needspace{4\baselineskip}\par\smallskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\par\smallskip}
\newcommand{\sectioneyebrow}[1]{\Needspace{10\baselineskip}\par\medskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\par\nopagebreak\smallskip}
\newcommand{\sectionwithlabel}[2]{\Needspace{10\baselineskip}\par\medskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\par\nopagebreak\vspace{-0.02in}\section{#2}}
\newcommand{\subsectionwithlabel}[2]{\Needspace{8\baselineskip}\par\smallskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\par\nopagebreak\vspace{-0.02in}\subsection{#2}}
\newcommand{\statuschipok}[1]{\textsf{\scriptsize\color{descentOk}[#1]}}
\newcommand{\statuschiphint}[1]{\textsf{\scriptsize\color{descentHint}[#1]}}
\newcommand{\statuschipbad}[1]{\textsf{\scriptsize\color{descentBad}[#1]}}
\newcommand{\claimtop}[2]{\Needspace{5\baselineskip}\par\smallskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\if\relax\detokenize{#2}\relax\else\enspace #2\fi\par\nopagebreak\smallskip}
\newcommand{\leadpara}[2]{\Needspace{7\baselineskip}\par\begingroup\large\color{descentTeal}\setlength{\parindent}{0pt}\lettrine[lines=2,loversize=0.08,lhang=0.02,nindent=0pt,findent=0.08em]{#1}{#2}\par\endgroup\medskip}
\newcommand{\leadparanodrop}[1]{\Needspace{6\baselineskip}\par\begingroup\large\color{descentTeal}\setlength{\parindent}{0pt}#1\par\endgroup\medskip}
\newenvironment{lessonbox}{\begin{tcolorbox}[enhanced,breakable,colback=white,colframe=descentLine,boxrule=0.4pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]}{\end{tcolorbox}}
\newenvironment{sourcesbox}{\begin{tcolorbox}[enhanced,breakable,colback=descentPaper,colframe=descentLine,boxrule=0.3pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]\footnotesize}{\end{tcolorbox}}
\newenvironment{quotebox}{\begin{quote}\itshape}{\end{quote}}
\newenvironment{notepara}{\par\small\color{descentMuted}}{\par}
\captionsetup{font=small,labelformat=empty,textfont={color=descentMuted}}
\XeTeXlinebreaklocale "zh"
\XeTeXlinebreakskip = 0pt plus 1pt`;
}

function titlePageLatex(config: PdfEdition & { root: string }): string {
  const logo = latexPath(path.join(config.root, "src/assets/images/brand/180-descent-icon.png"));
  const isZh = config.locale === "zh";
  const eyebrow = config.subtitle;
  const byline = isZh ? `作者：${config.authors}` : `By ${config.authors}`;
  const translator = isZh && config.translators ? `翻译：${config.translators}` : "";
  const editor = isZh ? "人工编辑：刘家昌" : "Human editor: Jason Lau";
  return String.raw`\clearpage
\thispagestyle{empty}
\pagecolor{descentTeal}
\color{white}
\begingroup
\newgeometry{margin=0in}
\vspace*{2.52in}
\hspace*{0.68in}
\begin{minipage}{4.55in}
\begin{tikzpicture}
\node[circle,fill=descentCream,inner sep=0pt,minimum size=1.18in] {\includegraphics[width=0.84in]{${logo}}};
\end{tikzpicture}\par
\vspace{0.32in}
{\ttfamily\fontsize{7.8}{10}\selectfont\addfontfeatures{LetterSpace=18}\MakeUppercase{${latexEscape(eyebrow)}}\par}
\vspace{0.18in}
{\displayfont\bfseries\fontsize{29}{31}\selectfont ${latexEscape(config.title)}\par}
\vspace{0.20in}
{\displayfont\itshape\fontsize{13.8}{17}\selectfont ${latexEscape(byline)}\par}
${translator ? `{\\displayfont\\itshape\\fontsize{13.8}{17}\\selectfont ${latexEscape(translator)}\\par}` : ""}
{\displayfont\itshape\fontsize{13.8}{17}\selectfont ${latexEscape(editor)}\par}
\end{minipage}
\restoregeometry
\endgroup
\clearpage
\nopagecolor
\color{descentInk}`;
}

function latexEscape(value: string): string {
  const escaped = normalizeText(value)
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
  return escaped
    .replace(/”\s*(?=[A-Za-z\\])/g, "”\\ ")
    .replaceAll("≠", "\\ensuremath{\\neq}")
    .replaceAll("≈", "\\ensuremath{\\approx}")
    .replaceAll("≤", "\\ensuremath{\\leq}")
    .replaceAll("≥", "\\ensuremath{\\geq}");
}

function normalizeText(value: string): string {
  return smartQuotes(decodeHtmlEntities(value))
    .replace(/([.?!])“(?=$|\s)/g, "$1”")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([”’])/g, "$1")
    .replace(/([“‘])\s+/g, "$1")
    .replace(/([”’])([A-Za-z])/g, "$1 $2")
    .replace(/\s+—\s*/g, " --- ")
    .replace(/\s+–\s*/g, " -- ");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function smartQuotes(value: string): string {
  let result = "";
  let openDouble = true;
  let openSingle = true;
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === "\"") {
      result += openDouble ? "“" : "”";
      openDouble = !openDouble;
    } else if (char === "'" && /[A-Za-z]/.test(value[index - 1] ?? "") && /[A-Za-z]/.test(value[index + 1] ?? "")) {
      result += "’";
    } else if (char === "'") {
      result += openSingle ? "‘" : "’";
      openSingle = !openSingle;
    } else {
      result += char;
    }
  }
  return result;
}

function normalizeInlineLatex(value: string): string {
  return value
    .replace(/\\mbox\{\\\(p\\\)\}\s*-value/g, "\\mbox{\\(p\\)-value}")
    .replace(/\\mbox\{\\emph\{p\}\}\s*-value/g, "\\mbox{\\emph{p}-value}")
    .replace(/\\emph\{p\}\s*-value/g, "\\mbox{\\emph{p}-value}")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([”’])/g, "$1")
    .replace(/([“‘])\s+/g, "$1")
    .replace(/”\s*(?=[A-Za-z\\])/g, "”\\ ")
    .trim();
}

function cleanEyebrowText(value: string): string {
  return value
    .replace(/^[◆◇▪●■□•·\s]+/, "")
    .replace(/\s+·\s*$/, "")
    .trim();
}

function cleanFigureCaption(value: string): string {
  return value
    .replace(/^[◆◇▪●■□•·\s]+/, "")
    .trim();
}

function romanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let remaining = value;
  let result = "";
  for (const [number, roman] of numerals) {
    while (remaining >= number) {
      result += roman;
      remaining -= number;
    }
  }
  return result;
}

function latexPath(value: string): string {
  return value.replaceAll("\\", "/").replaceAll(" ", "\\space ");
}

function sanitizeAssetName(value: string): string {
  return value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "asset";
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
