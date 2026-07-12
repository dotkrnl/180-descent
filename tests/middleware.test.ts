import { describe, expect, it, vi } from "vitest";
import { onRequest } from "../functions/_middleware";

describe("canonical host middleware", () => {
  it.each([
    "https://180-descent.pages.dev/009-systems-thinking-and-feedback/?mode=deep",
    "http://www.180d.io/zh/downloads/?format=pdf"
  ])("redirects %s to the canonical HTTPS host", async (requestUrl) => {
    const next = vi.fn(async () => new Response("next"));

    const response = await onRequest({ request: new Request(requestUrl), next });
    const expectedUrl = new URL(requestUrl);
    expectedUrl.protocol = "https:";
    expectedUrl.hostname = "180d.io";

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(expectedUrl.href);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    "https://180d.io/",
    "http://localhost:8788/preview/"
  ])("passes through requests for %s", async (requestUrl) => {
    const downstream = new Response("downstream", { status: 202 });
    const next = vi.fn(async () => downstream);

    const response = await onRequest({ request: new Request(requestUrl), next });

    expect(response).toBe(downstream);
    expect(next).toHaveBeenCalledOnce();
  });
});
