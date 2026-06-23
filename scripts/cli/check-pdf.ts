import { checkPdf } from "@lib/checks/pdf";
import { exitOnErrors } from "./support";

const result = await checkPdf({ root: process.cwd() });

exitOnErrors(result.errors, (error) => error);
