import { generateSocialCards } from "@lib/assets/social-cards";
import { runCli } from "./support";

await runCli(async () => {
  const result = await generateSocialCards({
    root: process.cwd()
  });

  if (!result.generated.length && !result.preserved.length) {
    console.log("Social cards are up to date.");
  } else {
    for (const filePath of result.generated) {
      console.log(`Generated ${filePath}`);
    }
    for (const filePath of result.preserved) {
      console.log(`Preserved ${filePath}`);
    }
  }
});
