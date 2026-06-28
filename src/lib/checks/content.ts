import { readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { compileCss } from "@lib/assets/css";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData } from "@lib/data/book";
import { readCreditsData } from "@lib/data/credits";
import { readSyllabusData } from "@lib/data/syllabus";
import { toPosixRelative } from "@lib/fs/path";
import { pathExists, walkFiles } from "@lib/fs/walk";
import type { Locale } from "@lib/schemas/day";
import { jsExpressionEnd } from "@lib/text/js";
import { stripFencedCodeBlocks } from "@lib/text/markdown";

interface ContentCheckOptions {
  root: string;
}

interface ContentCheckFailure {
  message: string;
}

type JsonPropValue =
  | { kind: "missing" }
  | { kind: "nonliteral" }
  | { kind: "invalid"; error: string }
  | { kind: "value"; value: unknown };

const ARTIFACT_UNFRIENDLY_PHRASES = ["Static version", "live website lets", "as a table", "Receipts"] as const;
const STATUS_VALUES = new Set(["ok", "hint", "bad"]);
const STATUS_COMPONENT_PATTERN = /<(StatusChip|StatusText|MaturityTimelineItem)\b[^>]*>/g;
const STATUS_PROP_PATTERN = /\bstatus\s*=\s*(?:\{\s*(?:"([^"]+)"|'([^']+)')\s*\}|"([^"]+)"|'([^']+)')/;
const SIMPLE_TABLE_PATTERN = /<SimpleTable\b[\s\S]*?(?:\/>|<\/SimpleTable>)/g;
const STATUS_CHIP_LABEL_MAX_CHARS = 28;
const STATUS_CHIP_LABEL_GATE_START_DAY = 8;
const UNSTYLED_STATUS_LIST_ITEM_PATTERN =
  /^-\s+(?!.*<StatusChip\b).*?(?:\b(?:established(?:\s+(?:concept|framework))?|promising(?:\s+hint)?|contested(?:\s*\/\s*hype)?)\b(?:\s+\([^)]*\))?|(?:已确立(?:的(?:概念|框架))?|有前景|有争议(?:／炒作风险)?)(?:（[^）]*）)?)\s*$/gim;
const UNSTYLED_INLINE_STATUS_PATTERN = /\bStatus:\s*(?:established|promising|contested)\b/i;
const UNSTYLED_FRONTIER_MARKER_PATTERN =
  /^(?:Frontier\s+\d{2}|前沿\s+\d{2})\s*\n\s*\n\s*(?:established|promising|contested|已确立|有前景|有争议)/gim;
const REDUNDANT_TERM_TIP_PATTERN =
  /<Term\b[^>]*>([^<]+)<\/Term><TipNote\b[^>]*\/>\s+(?:\b(?:is|are|means|links|says)\b|指|是|称为|叫做|会|把|用来)/g;
const PROJECT_TEXT_EXTS = new Set([".astro", ".cjs", ".css", ".html", ".json", ".md", ".mdx", ".mjs", ".scss", ".yaml", ".yml"]);
const CREDITED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".svg", ".webp"]);
const GENERATED_REFERENCE_CHECK_IGNORES = [".astro", "_site", "node_modules", "fonts", "generated", "tmp"];
const PARENT_MARKDOWN_PATTERN = /\.\.\/[^\s"'`)]+\.mdx?\b/;
const UNSUPPORTED_MDX_WRAPPER_PATTERNS: Array<[RegExp, string]> = [
  [/<header class=["']hero wrap["']>/, "use <Hero>"],
  [/<\/header>/, "use </Hero>"],
  [/<section(?:\s|>)/, "use Markdown structure, <ContentSection>, or <Sources>"],
  [/<\/section>/, "use Markdown structure, </ContentSection>, or </Sources>"],
  [/<\/?blockquote(?:\s|>)/, "use <BlockQuote>"],
  [/<h3>/, "use Markdown headings"],
  [/<\/?p(?:\s|>)/, "use Markdown paragraphs, <Lead>, <FormatOnly>, <LessonNote>, or a shared paragraph component"],
  [/<\/?(?:strong|b|em|span|small)(?:\s|>)/, "use Markdown emphasis or a shared inline component"],
  [/<br\s*\/?>/i, "use Markdown line breaks or a shared block component"],
  [/<\/?code(?:\s|>)/, "use Markdown backticks or fenced code blocks"],
  [/<\/?(?:ul|li)(?:\s|>)/, "use Markdown lists or shared list components"],
  [/<div class=["']roadmap["']>/, "use <Roadmap>"],
  [/<div class=["']def["']>/, "use <DefinitionBox>"],
  [/<figure class=["']appendix-figure\b/, "use <AppendixFigure>"],
  [/<ul class=["'](?:clean|check)["']>/, "use <LessonList>"],
  [/<ul class=["']mislist["']>/, "use <MisconceptionList>"],
  [/<span class=["']fix["']>/, "use <MisconceptionFix>"],
  [/<span class=["']table-subnote\b/, "use <TableSubnote>"],
  [/<span class=["']daymark["']>/, "use the <HeroEyebrow> dayMark prop"],
  [/<span class=["']meta["']>/, "use <Meta>"],
  [/<span class=["']threads-label["']>/, "use the <Threads> label prop"],
  [/<figure class=["']bayes-sieve["']>/, "use <BayesSieve>"],
  [/<p class=["']bs-total["']>/, "use <BayesSieve>"],
  [/<div class=["']mathline["']>/, "use <MathLine>"],
  [/<div class=["']camps["']>/, "use <ProbabilityCamps>"],
  [/<div class=["']camp\b/, "use <ProbabilityCamp>"],
  [/<span class=["']bs-symbol["']>/, "use <BayesSymbol>"],
  [/<span class=["']bs-note["']>/, "use <BayesNote>"],
  [/<span class=["']latin["']>/, "use <Latin>"],
  [/<span class=["']emoji["']>/, "use <Emoji>"],
  [/<div class=["']dek-grid["']>/, "use <DekGrid>"],
  [/<div class=["'](?:aside|formula|recap|whereblock|wrap|format-alt epub-only print-only|panel)\b/, "use shared lesson components"],
  [/<div class=["'](?:regress-map|tri-print)\b/, "use <AgrippaTrilemmaMap>"],
  [/<figure class=["'](?:hero-clock|hero-doors)\b/, "use shared figure components"],
  [/<figure class=["']lesson-figure[^"']*["']>\s*<img\b/, "use <ImageFigure>"],
  [/<div class=["']mh-machine["']>/, "use <ProbabilityMontyPanel>"],
  [/<div class=["']atlas["']>/, "use <IncomingWaveAtlas>"]
];
const RAW_INTERACTIVE_PATTERNS: Array<[RegExp, string]> = [
  [/<(?:button|input|select|textarea|canvas)\b/i, "raw control or canvas"],
  [/\s(?:on[a-z]+)=/i, "inline event handler"],
  [/\srole=["'](?:button|switch|slider|tab|tabpanel|checkbox|radio)["']/i, "interactive ARIA role"],
  [/\saria-(?:pressed|checked|expanded|controls)=/i, "interactive ARIA state"],
  [/\sdata-(?:action|case|exit|filter|mode|p|pick|preset|scn|state|step|target|value)=/i, "interactive data hook"]
];
const WEB_ONLY_COMPONENTS = new Set([
  "BayesTrap",
  "CellularAutomataRules",
  "CausalLadder",
  "ConfidenceIntervalCoverage",
  "CredenceDial",
  "DemarcationLab",
  "DiscoveryPurityEngine",
  "DoSeeCalculator",
  "EValueLedger",
  "EchoChamber",
  "EffectSizeDial",
  "EntropyDial",
  "FallacySpotter",
  "FalsePositiveFactory",
  "FalsePositiveRiskEngine",
  "GettierMachine",
  "GrueMachine",
  "GrokkingCurve",
  "HyperuniformPointFields",
  "HypeFilterTrainer",
  "InferenceInspector",
  "LandauerMachine",
  "GameOfLifeGun",
  "MurmurationEngine",
  "MutualInformationOverlap",
  "NonreciprocalPursuit",
  "PercolationThreshold",
  "PhysicalLearningNetwork",
  "PValueShapeSimulator",
  "ProbabilityMontyPanel",
  "RandomBooleanNetwork",
  "SValueBits",
  "SimpsonReversalMachine",
  "SpecificationCurve",
  "StakesDial",
  "StatisticsIncomingWaveLab"
]);
const ARTIFACT_COMPONENTS = new Set([
  ...WEB_ONLY_COMPONENTS,
  "AccuracyDomination",
  "AgrippaTrilemmaMap",
  "AppendixCard",
  "AppendixCardBody",
  "AppendixCardGrid",
  "AppendixCardMeta",
  "AppendixCardTitle",
  "AppendixFigure",
  "AppendixNote",
  "AppendixTimeline",
  "AppendixTimelineBody",
  "AppendixTimelineCitation",
  "AppendixTimelineItem",
  "AppendixTimelineList",
  "AppendixTimelineTitle",
  "AppendixTimelineYear",
  "Aside",
  "BayesHeaderNote",
  "BayesMeter",
  "BayesNote",
  "BayesSieve",
  "BayesSymbol",
  "BayesValue",
  "BlockQuote",
  "BlockTitle",
  "BridgeLabel",
  "Caption",
  "CausalDagExamples",
  "CausationScatterFigure",
  "Claim",
  "ClaimHeader",
  "CompareCard",
  "CompareCardMeta",
  "CompareCardTitle",
  "CompareList",
  "ComparePanel",
  "ComputationalCapacityLadderFigure",
  "ComplexityHump",
  "ContentSection",
  "ContinueNote",
  "ClosureMachine",
  "CurryHowardBridge",
  "DataTable",
  "DataTableBody",
  "DataTableCell",
  "DataTableHead",
  "DataTableHeader",
  "DataTableRow",
  "Day8StaticFigure",
  "DefinitionBox",
  "DekGrid",
  "Divider",
  "Emoji",
  "Emphasis",
  "EmergenceHero",
  "EpistemicBackstopFigure",
  "EscapeCard",
  "EscapeGrid",
  "FigureBox",
  "FigureBoxCaption",
  "ForkingPathsFigure",
  "FormatOnly",
  "Formula",
  "Fragment",
  "HammingCube",
  "Hero",
  "HeroDoorsFigure",
  "HeroEyebrow",
  "HeroSubhead",
  "Highlight",
  "HybridBox",
  "HybridTitle",
  "ImageFigure",
  "InferenceModesFigure",
  "InformationPhysicsFrontierMap",
  "InformationQuestionTree",
  "IncomingWaveAtlas",
  "KindsOfKnowingTree",
  "KnowledgeBeforeBeliefTimeline",
  "Label",
  "LadderKey",
  "LarissaRoadFigure",
  "Latin",
  "Lead",
  "LandauerEnergyLadder",
  "LessonList",
  "LessonListItem",
  "LessonNote",
  "LogicSchool",
  "LogicSchools",
  "MathBenchmarkLadderFigure",
  "MathBlock",
  "MathInline",
  "MathLine",
  "MathLineLabel",
  "MaturityTimeline",
  "MaturityTimelineItem",
  "Meta",
  "MilestoneDate",
  "MilestoneItem",
  "MilestoneList",
  "MilestoneTitle",
  "MiniList",
  "MiniListItem",
  "MisconceptionClaim",
  "MisconceptionFix",
  "MisconceptionItem",
  "MisconceptionList",
  "ModalRings",
  "OpenScienceReplicationRates",
  "Panel",
  "PanelNote",
  "PanelTitle",
  "ProbabilityCamp",
  "ProbabilityCamps",
  "QuineWebFigure",
  "QuoteSource",
  "Recap",
  "RecapItem",
  "RecapList",
  "Roadmap",
  "SectionEyebrow",
  "SimpleTable",
  "SourceNote",
  "Sources",
  "SourcesTitle",
  "SquareOfOppositionFigure",
  "StatusChip",
  "StatusChipRow",
  "StatusText",
  "StatisticsReformSpectrum",
  "StoppedClockFigure",
  "Strong",
  "SunriseInductionFigure",
  "TableSubnote",
  "TableWrap",
  "Term",
  "TheoryCard",
  "TheoryCardLead",
  "TheoryKey",
  "TheoryLadenSunriseFigure",
  "Threads",
  "TipNote",
  "TrilemmaKey",
  "TrilemmaKeyItem",
  "WhereBlock",
  "Wrap",
  "ZeteticNormTensionFigure"
]);

interface RegistryContentFile {
  label: string;
  relativePath: string;
  source: string;
  locale: Locale;
  title: string | null;
  requiresTitle: boolean;
}

export async function checkContent(options: ContentCheckOptions): Promise<ContentCheckFailure[]> {
  const failures: ContentCheckFailure[] = [];
  const daysDir = contentDaysDir(options.root);
  const registry = await loadContentRegistry({ daysDir });

  if (!registry.days.length) {
    failures.push({ message: "No registry days found" });
  }

  await checkDayBlocks(options.root, registry.days, failures);

  for (const day of registry.days) {
    for (const body of Object.values(day.bodies)) {
      const localeData = day.manifest.locales[body.locale];
      checkContentFile({
        label: `${body.locale.toUpperCase()} ${day.manifest.path}`,
        relativePath: toPosixRelative(options.root, path.join(day.directory, body.path)),
        source: body.source,
        locale: body.locale,
        title: localeData.title,
        requiresTitle: true
      }, failures);
    }

    for (const appendixBody of day.appendixBodies) {
      checkContentFile({
        label: `${appendixBody.locale.toUpperCase()} ${day.manifest.path} appendix ${appendixBody.appendixId}`,
        relativePath: toPosixRelative(options.root, path.join(day.directory, appendixBody.path)),
        source: appendixBody.source,
        locale: appendixBody.locale,
        title: null,
        requiresTitle: false
      }, failures);
    }
  }

  await checkInteractionScripts(options.root, registry.days, failures);
  await checkImageCredits(options.root, failures);
  await checkCssFonts(options.root, failures);
  await checkParentMarkdownReferences(options.root, failures);

  return failures;
}

async function checkDayBlocks(
  root: string,
  days: Awaited<ReturnType<typeof loadContentRegistry>>["days"],
  failures: ContentCheckFailure[]
): Promise<void> {
  const book = await readBookData(root);
  const syllabus = await readSyllabusData(root, "en");
  const syllabusDayCount = syllabus.blocks.reduce((total, block) => total + block.days.length, 0);
  if (book.totalDays !== syllabusDayCount) {
    failures.push({
      message: `book.yaml total_days ${book.totalDays} does not match syllabus day count ${syllabusDayCount}`
    });
  }
  checkPublishedDaySequence(days, failures);

  const syllabusBlocks = new Map<number, string>();
  for (const block of syllabus.blocks) {
    for (const day of block.days) {
      syllabusBlocks.set(day.day, block.title);
    }
  }

  for (const day of days) {
    const expectedBlock = syllabusBlocks.get(day.manifest.day);
    if (!expectedBlock) {
      failures.push({
        message: `${day.manifest.path} day ${day.manifest.day} is missing from syllabus-data.yaml`
      });
    } else if (day.manifest.block !== expectedBlock) {
      failures.push({
        message: `${day.manifest.path} block "${day.manifest.block}" does not match syllabus block "${expectedBlock}"`
      });
    }
  }
}

function checkPublishedDaySequence(
  days: Awaited<ReturnType<typeof loadContentRegistry>>["days"],
  failures: ContentCheckFailure[]
): void {
  const sortedDays = [...days].sort((a, b) => a.manifest.day - b.manifest.day);
  for (const [index, day] of sortedDays.entries()) {
    const expectedDay = index + 1;
    if (day.manifest.day !== expectedDay) {
      failures.push({
        message: `Published content days must be contiguous from day 1: expected day ${expectedDay}, got day ${day.manifest.day} (${day.manifest.path})`
      });
      return;
    }
  }
}

async function checkInteractionScripts(
  root: string,
  days: Awaited<ReturnType<typeof loadContentRegistry>>["days"],
  failures: ContentCheckFailure[]
): Promise<void> {
  const scriptsDir = path.join(root, "src/assets/js/interactions");
  const declared = new Set<string>();

  for (const day of days) {
    for (const script of day.manifest.interactionScripts) {
      declared.add(script);

      if (!await pathExists(path.join(scriptsDir, `${script}.js`))) {
        failures.push({
          message: `${day.manifest.path} declares missing interaction script "${script}"`
        });
      }
    }
  }

  if (!await pathExists(scriptsDir)) return;

  const files = await walkFiles(scriptsDir, { exts: ".js", ignoredDirNames: [] });
  for (const file of files) {
    const script = path.basename(file, ".js");
    if (!declared.has(script)) {
      failures.push({
        message: `${toPosixRelative(root, file)} is not registered by any day manifest interactionScripts`
      });
    }
  }
}

async function checkImageCredits(root: string, failures: ContentCheckFailure[]): Promise<void> {
  const credits = await readCreditsData(root);
  const creditedAssets = new Set<string>();

  for (const image of credits.images) {
    const asset = image.asset;
    creditedAssets.add(asset);
    if (!await pathExists(path.join(root, "src", asset.slice(1)))) {
      failures.push({ message: `credits image asset does not exist: ${asset}` });
    }
  }

  const openLicenseDir = path.join(root, "src/assets/images/open-license");
  if (!await pathExists(openLicenseDir)) return;

  for (const file of await walkFiles(openLicenseDir, { exts: CREDITED_IMAGE_EXTS, ignoredDirNames: [] })) {
    const asset = `/${toPosixRelative(path.join(root, "src"), file)}`;
    if (!creditedAssets.has(asset)) {
      failures.push({ message: `${asset} is missing from credits.yaml images` });
    }
  }
}

function checkContentFile(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const checkedFile = {
    ...file,
    source: stripFencedCodeBlocks(file.source)
  };

  if (/[{]%|%}/.test(checkedFile.source)) {
    failures.push({ message: `${checkedFile.relativePath} contains template syntax; use MDX components instead` });
  }

  if (/<\/?script\b/i.test(checkedFile.source)) {
    failures.push({ message: `${checkedFile.relativePath} contains inline script; use shared interaction assets instead` });
  }

  if (!hasMdxComponent(checkedFile.source, "Sources")) {
    failures.push({ message: `${checkedFile.label} has no sources section` });
  }

  if (!hasMdxComponent(checkedFile.source, "StatusChip")) {
    failures.push({ message: `${checkedFile.label} has no frontier status chips` });
  }

  if (checkedFile.source.includes("fonts.googleapis.com")) {
    failures.push({ message: `${checkedFile.relativePath} references remote Google Fonts` });
  }

  for (const phrase of ARTIFACT_UNFRIENDLY_PHRASES) {
    if (checkedFile.source.includes(phrase)) {
      failures.push({ message: `${checkedFile.relativePath} contains artifact-unfriendly phrase: ${phrase}` });
    }
  }

  if (checkedFile.requiresTitle) {
    checkMainTitle(checkedFile, failures);
  }

  checkStatusValues(checkedFile, failures);
  checkSimpleTables(checkedFile, failures);
  checkStatusChipLabels(checkedFile, failures);
  checkUnstyledStatusPhrases(checkedFile, failures);
  checkRedundantTermTips(checkedFile, failures);
  checkUnsupportedMdxWrappers(checkedFile, failures);
  checkRawInteractiveMarkup(checkedFile, failures);
  checkArtifactComponentContract(checkedFile, failures);
}

function checkStatusValues(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const match of file.source.matchAll(STATUS_COMPONENT_PATTERN)) {
    const component = match[1];
    const tag = match[0];
    const status = literalStatusValue(tag);
    if (!status) {
      failures.push({
        message: `${file.relativePath} has ${component} without a literal status; use ok, hint, or bad`
      });
      continue;
    }

    if (!STATUS_VALUES.has(status)) {
      failures.push({
        message: `${file.relativePath} has invalid ${component} status "${status}"; use ok, hint, or bad`
      });
    }
  }
}

function literalStatusValue(tag: string): string | null {
  const match = tag.match(STATUS_PROP_PATTERN);
  return match ? match[1] ?? match[2] ?? match[3] ?? match[4] ?? null : null;
}

function checkSimpleTables(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const match of file.source.matchAll(SIMPLE_TABLE_PATTERN)) {
    const tag = match[0];
    const headers = jsonPropValue(tag, "headers");
    const rows = jsonPropValue(tag, "rows");

    if (headers.kind === "invalid") {
      failures.push({
        message: `${file.relativePath} has SimpleTable headers prop that is not valid JSON: ${headers.error}`
      });
    } else if (!isNonEmptyStringArray(headers.kind === "value" ? headers.value : null)) {
      failures.push({
        message: `${file.relativePath} has SimpleTable without a non-empty literal string-array headers prop`
      });
    }

    if (rows.kind === "invalid") {
      failures.push({
        message: `${file.relativePath} has SimpleTable rows prop that is not valid JSON: ${rows.error}`
      });
    } else if (!isNonEmptyStringMatrix(rows.kind === "value" ? rows.value : null)) {
      failures.push({
        message: `${file.relativePath} has SimpleTable without a non-empty literal string-matrix rows prop`
      });
    } else if (headers.kind === "value" && isNonEmptyStringArray(headers.value) && rows.kind === "value" && hasMismatchedRowWidth(headers.value, rows.value)) {
      failures.push({
        message: `${file.relativePath} has SimpleTable rows whose column count does not match headers`
      });
    }
  }
}

function isNonEmptyStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string");
}

function isNonEmptyStringMatrix(value: unknown): boolean {
  return Array.isArray(value)
    && value.length > 0
    && value.every((row) => Array.isArray(row) && row.length > 0 && row.every((item) => typeof item === "string"));
}

function hasMismatchedRowWidth(headers: unknown, rows: unknown): boolean {
  if (!Array.isArray(headers) || !Array.isArray(rows)) return false;
  return rows.some((row) => Array.isArray(row) && row.length !== headers.length);
}

function jsonPropValue(tag: string, prop: string): JsonPropValue {
  const source = jsxExpressionPropValue(tag, prop);
  if (source === null) return { kind: "missing" };
  if (source.kind === "invalid") return source;
  if (source.kind === "nonliteral") return source;

  const value = source.value.trim();
  if (!value.startsWith("[")) return { kind: "nonliteral" };
  try {
    return { kind: "value", value: JSON.parse(value) };
  } catch (error) {
    return { kind: "invalid", error: error instanceof Error ? error.message : String(error) };
  }
}

function jsxExpressionPropValue(
  tag: string,
  prop: string
): { kind: "invalid"; error: string } | { kind: "nonliteral" } | { kind: "value"; value: string } | null {
  const match = tag.match(new RegExp(`\\b${prop}\\s*=`));
  if (!match || match.index === undefined) return null;

  let index = match.index + match[0].length;
  while (/\s/.test(tag[index] ?? "")) index += 1;
  if (tag[index] !== "{") return { kind: "nonliteral" };

  const end = jsExpressionEnd(tag, index);
  if (end === null) {
    return { kind: "invalid", error: `unterminated ${prop} expression` };
  }
  return { kind: "value", value: tag.slice(index + 1, end) };
}

function checkStatusChipLabels(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const dayNumber = Number(file.relativePath.match(/src\/content\/days\/(\d{3})-/)?.[1]);
  if (!Number.isFinite(dayNumber) || dayNumber < STATUS_CHIP_LABEL_GATE_START_DAY) return;

  for (const match of file.source.matchAll(/<StatusChip\b[^>]*\blabel=(?:\{"([^"]+)"\}|"([^"]+)"|'([^']+)')/g)) {
    const label = normalizeVisibleText(match[1] ?? match[2] ?? match[3] ?? "");
    if (label.length > STATUS_CHIP_LABEL_MAX_CHARS) {
      failures.push({
        message: `${file.relativePath} has overlong StatusChip label "${label}" (${label.length} chars); keep hype-filter tags short and move caveats into prose`
      });
    }
  }
}

function checkRedundantTermTips(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const match of file.source.matchAll(REDUNDANT_TERM_TIP_PATTERN)) {
    failures.push({
      message: `${file.relativePath} gives <Term>${normalizeVisibleText(match[1])}</Term> a tooltip immediately before the prose defines it; remove the redundant TipNote`
    });
  }
}

function checkUnstyledStatusPhrases(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const dayNumber = Number(file.relativePath.match(/src\/content\/days\/(\d{3})-/)?.[1]);
  if (!Number.isFinite(dayNumber) || dayNumber < STATUS_CHIP_LABEL_GATE_START_DAY) return;

  const source = file.source
    .replace(/<StatusChip\b[^>]*\/>/g, "")
    .replace(/<FormatOnly\b[^>]*>[\s\S]*?<\/FormatOnly>/g, "");
  for (const match of source.matchAll(UNSTYLED_STATUS_LIST_ITEM_PATTERN)) {
    failures.push({
      message: `${file.relativePath} contains unstyled list-item status tag "${normalizeVisibleText(match[0])}"; use <StatusChip> for hype-filter tags`
    });
  }
  if (UNSTYLED_INLINE_STATUS_PATTERN.test(source)) {
    failures.push({
      message: `${file.relativePath} contains unstyled inline "Status:" text; use <StatusChip> for hype-filter status labels`
    });
  }
  for (const match of source.matchAll(UNSTYLED_FRONTIER_MARKER_PATTERN)) {
    failures.push({
      message: `${file.relativePath} contains unstyled frontier marker "${normalizeVisibleText(match[0])}"; use <ClaimHeader> with <StatusChip>`
    });
  }
}

function checkMainTitle(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const titleMatch = file.source.match(/^#\s+(.+)$/m);
  if (!titleMatch) {
    failures.push({ message: `${file.label} has no lesson h1` });
    return;
  }

  if (!file.title) {
    failures.push({ message: `${file.label} has no manifest title` });
    return;
  }

  const h1Text = normalizeVisibleText(titleMatch[1]);
  const titleText = normalizeVisibleText(file.title);
  if (h1Text !== titleText) {
    failures.push({ message: `${file.label} h1 "${h1Text}" does not match manifest title "${titleText}"` });
  }
}

function checkUnsupportedMdxWrappers(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const [pattern, replacement] of UNSUPPORTED_MDX_WRAPPER_PATTERNS) {
    if (pattern.test(file.source)) {
      failures.push({ message: `${file.relativePath} contains unsupported MDX wrapper markup; ${replacement}` });
    }
  }
}

function checkRawInteractiveMarkup(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const [pattern, label] of RAW_INTERACTIVE_PATTERNS) {
    if (pattern.test(file.source)) {
      failures.push({
        message: `${file.relativePath} contains raw interactive markup (${label}); extract it to a lesson component`
      });
      return;
    }
  }
}

function checkArtifactComponentContract(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const unknown = new Set<string>();
  let webOnlyComponents = 0;

  for (const match of file.source.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    const name = match[1];
    if (!ARTIFACT_COMPONENTS.has(name)) unknown.add(name);
    if (WEB_ONLY_COMPONENTS.has(name)) webOnlyComponents += 1;
  }

  for (const name of unknown) {
    failures.push({
      message: `${file.relativePath} uses <${name}> without an artifact contract; classify its web, EPUB, and PDF behavior in checkContent`
    });
  }

  const webOnlyPanels = countWebOnlyPanels(file.source);
  const webOnly = webOnlyComponents + webOnlyPanels;
  const staticAlternates = countStaticArtifactAlternates(file.source);
  if (staticAlternates < webOnly) {
    failures.push({
      message: `${file.label} has ${webOnly} web-only artifact item(s) but only ${staticAlternates} static print/EPUB alternate(s)`
    });
  }
}

function countWebOnlyPanels(source: string): number {
  return [...source.matchAll(/<Panel\b[^>]*>/g)]
    .filter((match) => quotedAttr(match[0], "class")?.split(/\s+/).includes("web-only"))
    .length;
}

function countStaticArtifactAlternates(source: string): number {
  return [...source.matchAll(/<FormatOnly\b[^>]*>/g)]
    .filter((match) => quotedAttr(match[0], "media") === "print-epub" && quotedAttr(match[0], "variant") === "alternate")
    .length;
}

function quotedAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`));
  return match ? match[2] : null;
}

async function checkCssFonts(root: string, failures: ContentCheckFailure[]): Promise<void> {
  const css = await compileCss({ root });
  if (!css.includes("@font-face")) {
    failures.push({ message: "CSS does not declare local fonts" });
  }
}

async function checkParentMarkdownReferences(root: string, failures: ContentCheckFailure[]): Promise<void> {
  for (const file of await walkFiles(root, { exts: PROJECT_TEXT_EXTS, ignoredDirNames: GENERATED_REFERENCE_CHECK_IGNORES })) {
    const text = await readFile(file, "utf8");
    if (PARENT_MARKDOWN_PATTERN.test(text)) {
      failures.push({
        message: `${toPosixRelative(root, file)} references a parent Markdown file; keep canonical project content inside this repo`
      });
    }
  }
}

function hasMdxComponent(source: string, name: string): boolean {
  return new RegExp(`<${name}(?:\\s|>|/)`).test(source);
}

function normalizeVisibleText(text: string): string {
  const withoutTemplate = text
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "")
    .replace(/[*_`]/g, "");
  return cheerio
    .load(`<body>${withoutTemplate}</body>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}
