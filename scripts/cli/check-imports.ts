import { checkUnusedDefaultImports } from "@lib/checks/imports";
import { exitOnErrors, runCli } from "./support";

await runCli(async () => {
  const failures = await checkUnusedDefaultImports({ root: process.cwd() });

  exitOnErrors(failures, (failure) => `${failure.path} imports unused ${failure.name}`, {
    heading: "Import check failed:",
    prefix: "- "
  });
});
