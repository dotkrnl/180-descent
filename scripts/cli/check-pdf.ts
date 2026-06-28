import { checkPdf } from "@lib/checks/pdf";
import { exitOnErrors } from "./support";

const errors = await checkPdf({ root: process.cwd() });

exitOnErrors(errors, (error) => error);
