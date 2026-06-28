export function escapeHtml(value = ""): string {
  return escapeXml(value);
}

export function escapeXml(value = ""): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
