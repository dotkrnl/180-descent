import { createReadStream, type ReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http, { type Server } from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { isPathUnavailableError } from "@lib/fs/errors";
import { contentType, siteFileForUrlPath } from "@lib/static-site/url";

interface StaticSiteServer {
  server: Server;
  origin: string;
}

export async function startStaticSiteServer(siteDir: string, label: string): Promise<StaticSiteServer> {
  const server = http.createServer(async (request, response) => {
    try {
      const filePath = await resolveStaticFile(siteDir, request.url || "/");
      if (!filePath) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const stream = createReadStream(filePath);
      await waitForStreamOpen(stream);
      response.writeHead(200, { "content-type": contentType(filePath) });
      await pipeline(stream, response);
    } catch (error) {
      if (response.writableEnded) return;
      if (response.headersSent) {
        response.destroy();
        return;
      }
      response.writeHead(500);
      response.end(String(error));
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    await closeServer(server);
    throw new Error(`${label} server did not bind to a TCP port`);
  }

  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

export async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

async function resolveStaticFile(siteDir: string, urlPath: string): Promise<string | null> {
  const filePath = siteFileForUrlPath(siteDir, urlPath);
  if (!filePath) return null;
  return resolveStaticFilePath(filePath);
}

async function resolveStaticFilePath(filePath: string): Promise<string | null> {
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      return resolveStaticFilePath(path.join(filePath, "index.html"));
    }
    return filePath;
  } catch (error) {
    if (!isPathUnavailableError(error)) throw error;
    return null;
  }
}

async function waitForStreamOpen(stream: ReadStream): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onOpen = (): void => {
      stream.off("error", onError);
      resolve();
    };
    const onError = (error: Error): void => {
      stream.off("open", onOpen);
      reject(error);
    };
    stream.once("open", onOpen);
    stream.once("error", onError);
  });
}
