const canonicalHost = "180d.io";
const redirectHosts = new Set([
  "180-descent.pages.dev",
  "www.180d.io"
]);

export function onRequest(context) {
  const url = new URL(context.request.url);

  if (redirectHosts.has(url.hostname)) {
    url.protocol = "https:";
    url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
