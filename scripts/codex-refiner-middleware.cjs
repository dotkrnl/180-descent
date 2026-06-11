const { spawn } = require("node:child_process");
const { mkdtemp, readFile, readdir, rm, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");

const ENDPOINT = "/__codex/refine-description";
const SRC_DIR = path.join(process.cwd(), "src");
const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_CHARS = 4000;
const MAX_REASON_CHARS = 1000;
const CODEX_TIMEOUT_MS = 120000;
const EDITABLE_EXTENSIONS = new Set([".md", ".njk", ".yaml", ".yml"]);

function createCodexRefinerMiddleware(options = {}) {
  const endpoint = options.endpoint || ENDPOINT;

  return async function codexRefinerMiddleware(req, res, next) {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname !== endpoint) {
      if (typeof next === "function") return next();
      res.statusCode = 404;
      return res.end();
    }

    setJsonHeaders(res);

    if (!isLoopbackHost(req.headers.host || "")) {
      return sendJson(res, 403, { error: "Codex refinement is only available on the local dev server." });
    }

    if (req.method === "GET" || req.method === "HEAD") {
      res.statusCode = 200;
      if (req.method === "HEAD") return res.end();
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, HEAD, POST");
      return sendJson(res, 405, { error: "Use POST." });
    }

    let payload;
    try {
      payload = JSON.parse(await readRequestBody(req));
    } catch (error) {
      const status = error.code === "BODY_TOO_LARGE" ? 413 : 400;
      return sendJson(res, status, { error: error.message || "Invalid request body." });
    }

    const text = cleanInput(payload.text, MAX_TEXT_CHARS);
    const reason = cleanInput(payload.reason, MAX_REASON_CHARS);
    const pagePath = normalizePagePath(payload.pagePath);

    if (!text) {
      return sendJson(res, 400, { error: "Select text to refine first." });
    }

    try {
      const refined = await refineWithCodex({ text, reason });
      const patch = await applySourcePatch({ pagePath, original: text, refined });
      return sendJson(res, 200, { text: refined, patch });
    } catch (error) {
      return sendJson(res, 500, { error: error.message || "Codex failed to refine the selection." });
    }
  };
}

function isLoopbackHost(hostHeader) {
  let host = hostHeader;
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    host = end === -1 ? host.slice(1) : host.slice(1, end);
  } else {
    host = host.split(":")[0];
  }
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function setJsonHeaders(res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  return res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        const error = new Error("Request body is too large.");
        error.code = "BODY_TOO_LARGE";
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function cleanInput(value, limit) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, limit);
}

function normalizePagePath(value) {
  let pagePath = String(value || "/").split("?")[0].split("#")[0];
  if (!pagePath.startsWith("/")) pagePath = `/${pagePath}`;
  if (!path.extname(pagePath) && !pagePath.endsWith("/")) pagePath += "/";
  return pagePath;
}

async function refineWithCodex({ text, reason }) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "180-descent-codex-"));
  const outputPath = path.join(tempDir, "refined.txt");
  const prompt = buildPrompt({ text, reason });

  try {
    await runCodex(prompt, outputPath);
    const output = sanitizeCodexOutput(await readFile(outputPath, "utf8"));
    if (!output) {
      throw new Error("Codex returned an empty refinement.");
    }
    return output;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function buildPrompt({ text, reason }) {
  return [
    "You are refining selected public-facing description text from the web preview of The 180-Day Descent.",
    "",
    "Return only the replacement text. Do not include Markdown, labels, explanations, or quotation marks around the answer.",
    "",
    "Constraints:",
    "- Keep the same language as the selected text.",
    "- Preserve the original meaning, factual claims, names, dates, references, and pedagogical intent.",
    "- Improve clarity, rhythm, specificity, and precision.",
    "- Fit naturally where the selected text already appears.",
    "- Keep the length close to the original unless the editor's reason asks otherwise.",
    "- Do not invent new facts or citations.",
    "",
    "Editor reason:",
    reason || "(none)",
    "",
    "Selected text:",
    "<<<",
    text,
    ">>>"
  ].join("\n");
}

function runCodex(prompt, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("codex", [
      "--ask-for-approval",
      "never",
      "exec",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--color",
      "never",
      "--output-last-message",
      outputPath
    ], {
      cwd: process.cwd(),
      stdio: ["pipe", "ignore", "pipe"]
    });

    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Codex timed out while refining the selection."));
    }, CODEX_TIMEOUT_MS);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Unable to start Codex: ${error.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
        return;
      }

      const detail = stderr.trim().split("\n").slice(-4).join(" ");
      reject(new Error(detail || `Codex exited with status ${code}.`));
    });

    child.stdin.end(prompt);
  });
}

function sanitizeCodexOutput(output) {
  let text = String(output || "").trim();
  text = text.replace(/^```(?:text|markdown)?\s*/i, "").replace(/```$/i, "").trim();

  const quoted = text.match(/^["']([\s\S]*)["']$/);
  if (quoted) {
    text = quoted[1].trim();
  }

  return text.slice(0, MAX_TEXT_CHARS * 2);
}

async function applySourcePatch({ pagePath, original, refined }) {
  const pageCandidates = sourceCandidatesForPage(pagePath);
  const pagePatch = await findPatch(pageCandidates, original, refined);
  if (pagePatch) {
    return writePatch(pagePatch);
  }

  const globalCandidates = (await listEditableSourceFiles())
    .filter((filePath) => !pageCandidates.includes(filePath));
  const globalPatch = await findPatch(globalCandidates, original, refined);
  if (globalPatch) {
    return writePatch(globalPatch);
  }

  throw new Error("Codex refined the text, but the selected text was not found uniquely in source.");
}

function sourceCandidatesForPage(pagePath) {
  const candidates = [];
  const add = (relativePath) => {
    if (relativePath) candidates.push(path.join(process.cwd(), relativePath));
  };

  if (pagePath === "/") {
    add("src/index.njk");
  } else if (pagePath === "/zh/") {
    add("src/zh/index.njk");
  } else if (pagePath === "/syllabus/") {
    add("src/pages/syllabus.njk");
    add("src/_data/syllabus.yaml");
  } else if (pagePath === "/zh/syllabus/") {
    add("src/zh/syllabus.njk");
    add("src/_data/syllabus_zh.yaml");
  } else if (pagePath === "/introduction/") {
    add("src/pages/introduction.md");
  } else if (pagePath === "/zh/introduction/") {
    add("src/zh/introduction.md");
  } else if (pagePath === "/downloads/") {
    add("src/pages/downloads.md");
  } else if (pagePath === "/zh/downloads/") {
    add("src/zh/downloads.md");
  } else if (pagePath === "/credits/") {
    add("src/pages/credits.md");
  } else if (pagePath === "/zh/credits/") {
    add("src/zh/credits.md");
  } else if (pagePath === "/print/") {
    add("src/print.njk");
  } else if (pagePath === "/print-deep/") {
    add("src/print-deep.njk");
  } else if (pagePath === "/zh/print/") {
    add("src/zh/print.njk");
  } else if (pagePath === "/zh/print-deep/") {
    add("src/zh/print-deep.njk");
  }

  const zhDay = pagePath.match(/^\/zh\/days\/([^/]+)\/$/);
  if (zhDay) {
    add(`src/_includes/days/${zhDay[1]}/zh.njk`);
    add(`src/zh/days/day-${zhDay[1]}.md`);
  }

  const enDay = pagePath.match(/^\/days\/([^/]+)\/$/);
  if (enDay) {
    add(`src/_includes/days/${enDay[1]}/en.njk`);
    add(`src/days/day-${enDay[1]}.md`);
  }

  return uniquePaths(candidates);
}

async function listEditableSourceFiles(dir = SRC_DIR) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listEditableSourceFiles(fullPath));
    } else if (EDITABLE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function findPatch(filePaths, original, refined) {
  const strategies = buildPatchStrategies(original);

  for (const strategy of strategies) {
    const matches = [];

    for (const filePath of uniquePaths(filePaths)) {
      let contents;
      try {
        contents = await readFile(filePath, "utf8");
      } catch {
        continue;
      }

      for (const match of findStrategyMatches(contents, strategy)) {
        matches.push({ filePath, contents, match, strategy, refined });
        if (matches.length > 1) break;
      }

      if (matches.length > 1) break;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length > 1) {
      throw new Error("Codex refined the text, but the selected text appears more than once in source.");
    }
  }

  return null;
}

function buildPatchStrategies(original) {
  const strategies = [
    { name: "exact", needle: original, escaped: false },
    { name: "html-exact", needle: escapeHtml(original), escaped: true }
  ];

  if (original.length >= 15) {
    strategies.push(
      { name: "whitespace", regex: flexibleWhitespaceRegex(original), escaped: false },
      { name: "html-whitespace", regex: flexibleWhitespaceRegex(escapeHtml(original)), escaped: true }
    );
  }

  return strategies;
}

function findStrategyMatches(contents, strategy) {
  if (strategy.needle) {
    return findExactMatches(contents, strategy.needle);
  }

  const matches = [];
  let match;
  while ((match = strategy.regex.exec(contents)) !== null) {
    matches.push({ index: match.index, text: match[0] });
    if (matches.length > 1) break;
  }
  return matches;
}

function findExactMatches(contents, needle) {
  if (!needle) return [];

  const matches = [];
  let index = contents.indexOf(needle);
  while (index !== -1) {
    matches.push({ index, text: needle });
    if (matches.length > 1) break;
    index = contents.indexOf(needle, index + needle.length);
  }
  return matches;
}

function flexibleWhitespaceRegex(text) {
  const tokens = text.trim().split(/\s+/).map(escapeRegExp);
  return new RegExp(tokens.join("\\s+"), "g");
}

async function writePatch(patch) {
  const { contents, filePath, match, strategy, refined } = patch;
  const replacement = replacementForMatch(contents, match, refined, strategy.escaped);
  const updated = contents.slice(0, match.index) + replacement + contents.slice(match.index + match.text.length);

  await writeFile(filePath, updated);

  return {
    file: path.relative(process.cwd(), filePath),
    strategy: strategy.name
  };
}

function replacementForMatch(contents, match, refined, escaped) {
  if (escaped) {
    return escapeHtml(refined);
  }

  if (isYamlScalarMatch(contents, match)) {
    return JSON.stringify(refined);
  }

  return refined;
}

function isYamlScalarMatch(contents, match) {
  const lineStart = contents.lastIndexOf("\n", match.index - 1) + 1;
  const nextLine = contents.indexOf("\n", match.index);
  const lineEnd = nextLine === -1 ? contents.length : nextLine;
  const before = contents.slice(lineStart, match.index);
  const after = contents.slice(match.index + match.text.length, lineEnd);

  return /^(\s*-\s*)?[\w-]+:\s*$/.test(before) && after.trim() === "";
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniquePaths(paths) {
  return Array.from(new Set(paths));
}

module.exports = {
  createCodexRefinerMiddleware,
  applySourcePatch
};
