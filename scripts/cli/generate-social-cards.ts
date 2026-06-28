import { generateSocialCards } from "@lib/assets/social-cards";

const result = await generateSocialCards({
  root: process.cwd()
});

if (!result.generated.length && !result.refreshed.length) {
  console.log("Social cards are up to date.");
} else {
  for (const filePath of result.generated) {
    console.log(`Generated ${filePath}`);
  }
  for (const filePath of result.refreshed) {
    console.log(`Refreshed ${filePath}`);
  }
}
