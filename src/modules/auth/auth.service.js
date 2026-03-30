import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../../config/db.js";
import { users, refreshTokens } from "../../config/schema.js"

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { decode } from "jsonwebtoken";



//register

export const registerUser = async ({ name, password, email, role }) => {

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
        const error = new Error("Email already Registered");
        error.status = 409;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({ name, email, password: hashedPassword, role }).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
    });
    return newUser
}

//login

export const loginUser = async ({ email, password }) => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
        const error = new Error("Invalid Credentials");
        error.status = 401;
        throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error("Invalid Credentials");
        error.status = 401;
        throw error;

    }
    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({
        userId: user.id,
        token: refreshToken,
        expiresAt
    });
    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };

}


export const refreshAccessToken = async (token) => {
    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch {
        const error = new Error("Invalid or expired refresh Token");
        error.status = 401;
        throw error;

    }
    const [storedToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if (!storedToken) {
        const error = new Error("Refresh Token nOt found");
        error.status = 401;
        throw error;

    }
    if (new Date() > storedToken.expiresAt) {
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
        const error = new Error("Refresh token Expired");
        error.status = 401;
        throw error;


    }
    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    return { accessToken };
}

export const logoutUser = async (token) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    return { message: "Logout Successfully" };
}
