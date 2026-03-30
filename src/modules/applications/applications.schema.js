import { pgTable, uuid, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

import { users } from "../auth/auth.schema.js";
import { jobs } from "../jobs/jobs.schema.js";

export const appStatusEnum = pgEnum("app_status", ["PENDING", "ACCEPTED", "REJECTED"]);


export const applications = pgTable("applications", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
    developerId: uuid("developer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: appStatusEnum("status").default("PENDING").notNull(),
    matchScore: integer("match_score"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
})