const canonicalHost = "180d.io";
const redirectHosts = new Set([
  "180-descent.pages.dev",
  "www.180d.io"
]);

export interface MiddlewareContext {
  request: Request;
  next(): Promise<Response>;
}

export function onRequest(context: MiddlewareContext): Response | Promise<Response> {
  const url = new URL(context.request.url);

  if (redirectHosts.has(url.hostname)) {
    url.protocol = "https:";
    url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
