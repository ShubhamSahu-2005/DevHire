import "dotenv/config";
import db from "./src/config/db.js";
import { users } from "./src/config/schema.js";

async function checkUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log("Users in DB:", JSON.stringify(allUsers, null, 2));
    } catch (e) {
        console.error("Error fetching users:", e);
    }
    process.exit();
}

checkUsers();
