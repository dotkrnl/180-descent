import { buildAllPdfs } from "@lib/artifacts";

try {
  await buildAllPdfs({ root: process.cwd() });
} catch (error) {
  console.error(error);
  process.exit(1);
}
