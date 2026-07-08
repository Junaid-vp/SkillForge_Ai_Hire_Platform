console.log("Starting ESM resume dependencies diagnostic...");

const targets: [string, () => Promise<any>][] = [
  ["isHr", () => import("../src/HR/Middleware/isHr.js")],
  ["multer", () => import("../src/HR/Middleware/multer.js")],
  ["resumeParser", () => import("../src/HR/services/resumeParser.js")],
  ["cloudinary", () => import("../src/HR/services/cloudinary.js")],
  ["ResumeController", () => import("../src/HR/Controller/ResumeController.js")]
];


async function run() {
  for (const [name, fn] of targets) {
    console.log(`[Diagnostic] Importing: ${name}...`);
    try {
      await fn();
      console.log(`[Diagnostic] Successfully imported: ${name}`);
    } catch (e: any) {
      console.error(`[Diagnostic] Error importing ${name}:`, e.message);
    }
  }
  console.log("[Diagnostic] Done testing resume dependencies!");
}

run();
