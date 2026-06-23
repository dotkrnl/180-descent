import { checkContent } from "@lib/checks/content";
import { exitOnErrors } from "./support";

const failures = await checkContent({ root: process.cwd() });

exitOnErrors(failures, (failure) => failure.message);
