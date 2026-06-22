import { buildAllEpubs } from "@lib/artifacts";

try {
  await buildAllEpubs({ root: process.cwd() });
} catch (error) {
  console.error(error);
  process.exit(1);
}
