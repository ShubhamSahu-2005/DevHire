import { eq } from "drizzle-orm";
import db from "../../config/db.js";
import { users } from "../auth/auth.schema.js";

// Get own profile
export const getProfile = async (userId) => {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            skills: users.skills,
            bio: users.bio,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));

    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return user;
};

// Update profile — developer adds their skills here
export const updateProfile = async (userId, updates) => {
    const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            skills: users.skills,
            bio: users.bio,
        });

    return updated;
};