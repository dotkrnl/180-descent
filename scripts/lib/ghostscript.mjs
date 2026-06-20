import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const DEFAULT_MAX_BUFFER = 1024 * 1024;

export async function ghostscriptText(pdfPath, { firstPage, lastPage, timeout = 30000, maxBuffer = DEFAULT_MAX_BUFFER } = {}) {
  const args = ["-q", "-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=txtwrite"];
  if (firstPage != null) args.push(`-dFirstPage=${firstPage}`);
  if (lastPage != null) args.push(`-dLastPage=${lastPage}`);
  args.push("-o", "-", pdfPath);
  const { stdout } = await execFileAsync("gs", args, { maxBuffer, timeout });
  return stdout;
}

export async function ghostscriptAllPagesText(pdfPath, pageCount, { timeout = 30000, maxBuffer = DEFAULT_MAX_BUFFER } = {}) {
  const workDir = await mkdtemp(path.join(tmpdir(), "180-descent-pdf-text-"));
  const outputPattern = path.join(workDir, "page-%03d.txt");
  try {
    await execFileAsync("gs", [
      "-q",
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-sDEVICE=txtwrite",
      `-sOutputFile=${outputPattern}`,
      pdfPath
    ], { maxBuffer, timeout });

    return Promise.all(Array.from({ length: pageCount }, async (_, index) => {
      const file = path.join(workDir, `page-${String(index + 1).padStart(3, "0")}.txt`);
      return readFile(file, "utf8").catch(() => "");
    }));
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function ghostscriptPageCount(pdfPath, { timeout = 15000 } = {}) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dNOSAFER",
    "-dNODISPLAY",
    "-c",
    `${postScriptString(path.resolve(pdfPath))} (r) file runpdfbegin pdfpagecount = quit`
  ], { timeout });
  return Number(stdout.trim());
}

export async function ghostscriptBoundingBox(pdfPath, pageNumber, { timeout = 15000, maxBuffer = DEFAULT_MAX_BUFFER } = {}) {
  const { stdout, stderr } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=bbox",
    `-dFirstPage=${pageNumber}`,
    `-dLastPage=${pageNumber}`,
    pdfPath
  ], { maxBuffer, timeout });
  const match = `${stdout}\n${stderr}`.match(/%%HiResBoundingBox:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
  if (!match) return [Infinity, Infinity, -Infinity, -Infinity];
  return match.slice(1).map(Number);
}

export async function ghostscriptPagePpm(pdfPath, pageNumber, { resolution = 12, timeout = 15000, maxBuffer = DEFAULT_MAX_BUFFER } = {}) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=ppmraw",
    `-r${resolution}`,
    `-dFirstPage=${pageNumber}`,
    `-dLastPage=${pageNumber}`,
    "-o",
    "-",
    pdfPath
  ], { encoding: "buffer", maxBuffer, timeout });
  return { ...parsePpm(stdout), buffer: stdout };
}

export function parsePpm(buffer) {
  let index = 0;
  const tokens = [];
  while (tokens.length < 4 && index < buffer.length) {
    while (index < buffer.length) {
      while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
      if (buffer[index] !== 35) break;
      while (index < buffer.length && buffer[index] !== 10) index++;
    }
    const start = index;
    while (index < buffer.length && !/\s/.test(String.fromCharCode(buffer[index]))) index++;
    if (index > start) tokens.push(buffer.slice(start, index).toString("ascii"));
  }
  while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
  if (tokens[0] !== "P6") throw new Error(`Unsupported PPM header: ${tokens.join(" ")}`);
  return {
    width: Number(tokens[1]),
    height: Number(tokens[2]),
    max: Number(tokens[3]),
    dataOffset: index
  };
}

export function postScriptString(value) {
  return `(${String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")})`;
}
