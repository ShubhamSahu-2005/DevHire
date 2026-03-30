// This file only re-exports all schemas
// Drizzle migrations use this single entry point
// Individual modules import directly from their own schema files

export * from "../modules/auth/auth.schema.js";
export * from "../modules/jobs/jobs.schema.js";
export * from "../modules/applications/applications.schema.js";