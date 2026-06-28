import {
  checkTools,
  formatPreflightFailure,
  formatToolList,
  parsePreflightArgs,
  PreflightError,
  resolveToolNames
} from "@lib/tools/preflight";

const { toolNames, optional, list } = parsePreflightArgs(process.argv.slice(2));

if (list) {
  console.log(formatToolList());
} else {
  try {
    const names = resolveToolNames(toolNames);
    const result = checkTools(names, { throwOnMissing: !optional });
    for (const tool of result.present) {
      console.log(`ok ${tool.name} (${tool.category}): ${tool.version}`);
    }
    for (const tool of result.missing) {
      const category = tool.category ? ` (${tool.category})` : "";
      console.log(`missing ${tool.name}${category}: ${tool.error.message}`);
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
