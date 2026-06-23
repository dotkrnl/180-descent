import { fileURLToPath } from "node:url";
import { generateSocialCards } from "@lib/assets/social-cards";

try {
  const result = await generateSocialCards({
    root: process.cwd(),
    dependencyFiles: [fileURLToPath(import.meta.url)]
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
} catch (error) {
  console.error(error);
  process.exit(1);
}
