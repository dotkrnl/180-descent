import { prepareLatinFonts } from "@lib/assets";

try {
  const { copied } = await prepareLatinFonts({ root: process.cwd() });
  console.log(`Latin fonts prepared: ${copied} fonts`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
