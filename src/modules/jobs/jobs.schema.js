import { pgTable, uuid, varchar, timestamp, pgEnum, integer, text } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema.js";

export const jobStatusEnum = pgEnum("job_status", ["OPEN", "CLOSED"]);

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    skills: varchar("skills", { length: 100 }).array().notNull(),
    salary: integer("salary").notNull(),
    location: varchar("location", { length: 100 }).notNull(),
    status: jobStatusEnum("status").default("OPEN").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})