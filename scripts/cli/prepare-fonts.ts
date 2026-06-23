import { prepareLatinFonts } from "@lib/assets/fonts";
import { runCli } from "./support";

await runCli(async () => {
  const { copied } = await prepareLatinFonts({ root: process.cwd() });
  console.log(`Latin fonts prepared: ${copied} fonts`);
});
