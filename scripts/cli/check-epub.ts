import { checkEpub } from "@lib/checks/epub";
import { exitOnErrors } from "./support";

const errors = await checkEpub({ root: process.cwd() });

exitOnErrors(errors, (error) => error);
