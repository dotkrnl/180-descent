import { checkUnusedDefaultImports } from "@lib/checks/imports";
import { exitOnErrors } from "./support";

const failures = await checkUnusedDefaultImports({ root: process.cwd() });

exitOnErrors(failures, (failure) => `${failure.path} imports unused ${failure.name}`, {
  heading: "Import check failed:",
  prefix: "- "
});
