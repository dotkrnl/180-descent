import {
  checkTools,
  formatPreflightFailure,
  formatToolList,
  parsePreflightArgs,
  PreflightError,
  resolveToolNames
} from "@lib/tools/preflight";

const { toolNames, optional, list, errors } = parsePreflightArgs(process.argv.slice(2));

if (errors.length) {
  console.error("Usage: npm run preflight -- [--optional] [--list] [--group=<name>] [tool ...]");
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
} else if (list) {
  console.log(formatToolList());
} else {
  try {
    const names = resolveToolNames(toolNames);
    const result = checkTools(names, { throwOnMissing: !optional });
    for (const tool of result.present) {
      console.log(`ok ${tool.name}: ${tool.version}`);
    }
    for (const tool of result.missing) {
      console.log(`missing ${tool.name}: ${tool.error.message}`);
    }
    if (result.missing.length && optional) {
      console.log("Optional preflight completed with missing tools.");
    }
  } catch (error) {
    if (error instanceof PreflightError) {
      console.error(formatPreflightFailure(error.missing));
      process.exit(1);
    }
    throw error;
  }
}
