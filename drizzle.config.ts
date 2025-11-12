import { defineConfig } from "drizzle-kit";
import { postgresql } from "./config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/schema",
  out: "./drizzle",
  migrations: {
    schema: "public",
  },
  dbCredentials: postgresql,
  strict: true,
  extensionsFilters: ["postgis"],
});
