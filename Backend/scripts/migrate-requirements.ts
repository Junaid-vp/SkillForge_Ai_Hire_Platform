import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting requirements migration...");

  // 1. Manually change the column type using raw SQL to bypass Prisma's restriction
  console.log("🛠️  Changing column type to JSONB...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "TaskLibrary" 
    ALTER COLUMN "requirements" TYPE JSONB 
    USING to_jsonb(requirements);
  `);

  // 2. Get all tasks to fix the formatting (convert JSON strings to JSON arrays)
  const tasks = await prisma.taskLibrary.findMany();
  console.log(`🔍 Found ${tasks.length} tasks to process.`);

  for (const task of tasks) {
    const rawReqs = task.requirements;

    // Skip if it's already an array (or looks like one)
    if (Array.isArray(rawReqs)) continue;

    let finalArray: string[] = [];

    if (typeof rawReqs === "string") {
      // Handle pipe-separated or newline-separated strings
      if (rawReqs.includes("|")) {
        finalArray = rawReqs.split("|").map(r => r.trim()).filter(Boolean);
      } else if (rawReqs.includes("\n")) {
        finalArray = rawReqs.split("\n").map(r => r.trim()).filter(Boolean);
      } else if (rawReqs.trim()) {
        finalArray = [rawReqs.trim()];
      }
    }

    if (finalArray.length > 0) {
      await prisma.taskLibrary.update({
        where: { id: task.id },
        data: { requirements: finalArray }
      });
      console.log(`✅ Migrated task: ${task.title}`);
    }
  }

  console.log("✨ Migration complete!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
