import { buildAllEpubs } from "@lib/artifacts/epub/build";

await buildAllEpubs({ root: process.cwd() });
