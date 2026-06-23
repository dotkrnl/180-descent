import { buildAllEpubs } from "@lib/artifacts/epub/build";
import { runCli } from "./support";

await runCli(() => buildAllEpubs({ root: process.cwd() }));
