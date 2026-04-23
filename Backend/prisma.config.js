import { defineConfig } from "@prisma/config";

// Only load dotenv if we are NOT in Docker (where DATABASE_URL is already set)
if (!process.env.DATABASE_URL) {
  try {
    const { config } = await import("dotenv");
    config();
  } catch (e) {
    // dotenv not found or other issue
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});