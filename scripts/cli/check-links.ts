import { checkLinks } from "@lib/checks/links";
import { exitOnErrors } from "./support";

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--site-only");
if (unknown.length) {
  console.error("Usage: npm run check:links -- [--site-only]");
  console.error(unknown.map((arg) => `- Unknown option: ${arg}`).join("\n"));
  process.exit(1);
}

const failures = await checkLinks({
  root: process.cwd(),
  requireArtifactTargets: !args.includes("--site-only")
});

exitOnErrors(failures, (failure) => failure.message);
