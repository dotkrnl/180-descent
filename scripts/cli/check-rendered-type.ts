import { checkRenderedType, RENDERED_TYPE_FAILURE_HEADING } from "@lib/checks/rendered-type";
import { exitOnErrors } from "./support";

const result = await checkRenderedType({ root: process.cwd() });

exitOnErrors(result.errors, (error) => error, {
  heading: RENDERED_TYPE_FAILURE_HEADING
});

console.log(`Rendered typography check passed for ${result.checkedPages} pages.`);
