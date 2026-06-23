import { buildAllPdfs } from "@lib/artifacts/pdf/xetex";

try {
  await buildAllPdfs({ root: process.cwd() });
} catch (error) {
  console.error(error);
  process.exit(1);
}
