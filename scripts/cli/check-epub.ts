import { checkEpub } from "@lib/checks/epub";
import { exitOnErrors } from "./support";

const result = await checkEpub({ root: process.cwd() });

exitOnErrors(result.errors, (error) => error);
