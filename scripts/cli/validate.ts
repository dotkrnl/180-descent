import { refactorFoundation } from "@lib/foundation";

if (refactorFoundation.status !== "foundation-ready") {
  throw new Error("Refactor foundation is not ready.");
}

console.log("Refactor foundation validated.");
