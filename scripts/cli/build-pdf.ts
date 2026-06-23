import { buildAllPdfs } from "@lib/artifacts/pdf/xetex";
import { runCli } from "./support";

await runCli(() => buildAllPdfs({ root: process.cwd() }));
