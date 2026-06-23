import { checkLinks } from "@lib/checks/links";
import { exitOnErrors } from "./support";

const failures = await checkLinks({ root: process.cwd() });

exitOnErrors(failures, (failure) => failure.message);
