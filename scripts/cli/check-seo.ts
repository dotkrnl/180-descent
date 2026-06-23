import { checkSeo } from "@lib/checks/seo";
import { exitOnErrors } from "./support";

const result = await checkSeo({ root: process.cwd() });

exitOnErrors(result.errors, (error) => error, {
  heading: "SEO check failed:",
  prefix: "- "
});

console.log(`SEO check passed for ${result.checkedHtmlFiles} HTML files.`);
