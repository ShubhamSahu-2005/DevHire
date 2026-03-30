import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";


export const roleEnum = pgEnum("role", ["DEVELOPER", "RECRUITER", "COMPANY"]);


export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_At").defaultNow().notNull(),
})

export const refreshTokens = pgTable("refresh_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 500 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})