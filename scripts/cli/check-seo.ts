import { checkSeo } from "@lib/checks";

const result = await checkSeo({ root: process.cwd() });

if (result.errors.length) {
  console.error("SEO check failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`SEO check passed for ${result.checkedHtmlFiles} HTML files.`);
