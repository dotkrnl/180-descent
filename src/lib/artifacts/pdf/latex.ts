export function latexEscape(value: string): string {
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
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (match) => `\\textsuperscript{${superScriptCharacters(match)}}`)
    .replaceAll("ₐ", "\\textsubscript{a}")
    .replaceAll("ᵐ", "\\textsuperscript{m}")
    .replace(/√([A-Za-z0-9])/g, (_, radicand: string) => `\\ensuremath{\\sqrt{${radicand}}}`)
    .replace(/”\s*(?=[A-Za-z\\])/g, "”\\ ")
    .replaceAll("≠", "\\ensuremath{\\neq}")
    .replaceAll("≈", "\\ensuremath{\\approx}")
    .replaceAll("≤", "\\ensuremath{\\leq}")
    .replaceAll("≥", "\\ensuremath{\\geq}")
    .replaceAll("→", "\\ensuremath{\\rightarrow}")
    .replaceAll("←", "\\ensuremath{\\leftarrow}")
    .replaceAll("↔", "\\ensuremath{\\leftrightarrow}");
}

function superScriptCharacters(value: string): string {
  const characters = new Map([
    ["⁰", "0"],
    ["¹", "1"],
    ["²", "2"],
    ["³", "3"],
    ["⁴", "4"],
    ["⁵", "5"],
    ["⁶", "6"],
    ["⁷", "7"],
    ["⁸", "8"],
    ["⁹", "9"],
    ["⁺", "+"],
    ["⁻", "-"]
  ]);
  return [...value].map((char) => characters.get(char) ?? char).join("");
}

function normalizeText(value: string): string {
  return smartQuotes(normalizePdfGlyphs(decodeHtmlEntities(value)))
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

export function normalizePdfGlyphs(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[⇒]/g, "→")
    .replace(/[⇐]/g, "←")
    .replace(/[⇔]/g, "↔")
    .replace(/[∀]/g, "forall ")
    .replace(/[∃]/g, "exists ")
    .replace(/[¬]/g, "not ")
    .replace(/[α]/g, "alpha")
    .replace(/[βΒ]/g, "beta")
    .replace(/[π]/g, "pi")
    .replace(/[Σ]/g, "Sigma")
    .replace(/[ℤ]/g, "Z")
    .replace(/[□]/g, "box")
    .replace(/[◇◈]/g, "")
    .replace(/[≈]/g, " approximately ")
    .replace(/[≅]/g, " approximately equal ")
    .replace(/[↑]/g, " up ")
    .replace(/[↩]/g, "←")
    .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[🐟🪄🔢🤖]/gu, "")
    .replace(/[†‡]/g, "");
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
      result += "'";
    } else if (char === "'" && /[A-Za-z0-9]/.test(value[index - 1] ?? "")) {
      result += "'";
    } else if (char === "'") {
      result += openSingle ? "‘" : "’";
      openSingle = !openSingle;
    } else {
      result += char;
    }
  }
  return result;
}

export function normalizeInlineLatex(value: string): string {
  return value
    .replace(/\\mbox\{\\\(p\\\)\}\s*-value/g, "\\(p\\)-value")
    .replace(/\\mbox\{\\emph\{p\}\}\s*-value/g, "\\emph{p}-value")
    .replace(/\\emph\{p\}\s*-value/g, "\\emph{p}-value")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([”’])/g, "$1")
    .replace(/([“‘])\s+/g, "$1")
    .replace(/”\s*(?=[A-Za-z\\])/g, "”\\ ")
    .trim();
}

export function cleanEyebrowText(value: string): string {
  return cleanDecorativePrefix(value)
    .replace(/\s+·\s*$/, "")
    .trim();
}

export function cleanDecorativePrefix(value: string): string {
  return value
    .replace(/^[◆◇▪●■□•·▮\s]+/, "")
    .trim();
}

export function cleanFigureCaption(value: string): string {
  return cleanDecorativePrefix(value)
    .replace(/log216\s*=\s*4/g, "\\(\\log_2 16 = 4\\)");
}

export function isDecorativeOnly(value: string): boolean {
  return /^[◆◇▪●■□•·▮∞↻\s]+$/.test(value);
}

export function romanNumeral(value: number): string {
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

export function latexPath(value: string): string {
  return value.replaceAll("\\", "/").replaceAll(" ", "\\space ");
}

export function latexHrefEscape(value: string): string {
  return value
    .replaceAll("\\", "/")
    .replaceAll(" ", "%20")
    .replaceAll("%", "\\%")
    .replaceAll("#", "\\#")
    .replaceAll("&", "\\&")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}");
}

export function sanitizeBookmarkAnchor(value: string): string {
  return value
    .replace(/[^A-Za-z0-9:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "bookmark";
}

export function sanitizeAssetName(value: string): string {
  return value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "asset";
}
