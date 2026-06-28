import { buildAllPdfs } from "@lib/artifacts/pdf/xetex";

await buildAllPdfs({ root: process.cwd() });
