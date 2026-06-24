import path from "node:path";
import { isPathInside, toPosixRelative } from "@lib/fs/path";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".epub", "application/epub+zip"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"]
]);

export function contentType(filePath: string): string {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

export function urlForHtml(siteDir: string, filePath: string): string {
  const rel = toPosixRelative(siteDir, filePath);
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

export function sitePathForUrlPath(siteDir: string, urlPath: string): string {
  const decoded = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const clean = decoded.replace(/^\/+/, "");
  const root = path.resolve(siteDir);
  const resolved = path.resolve(root, clean);
  return isPathInside(root, resolved) ? resolved : "";
}

export function sitePathForHref(siteDir: string, siteUrl: string, href: string): string {
  if (href.startsWith("http") && !href.startsWith(siteUrl)) return "";
  const parsed = href.startsWith("http") ? new URL(href) : new URL(href, siteUrl);
  return sitePathForUrlPath(siteDir, parsed.pathname);
}

export function siteHtmlFileForUrl(siteDir: string, urlPath: string): string {
  const routePath = sitePathForUrlPath(siteDir, urlPath);
  return routePath ? path.join(routePath, "index.html") : "";
}
