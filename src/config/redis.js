import { Redis } from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("[Redis] Connected SuccessFully");

})
redis.on("error", (err) => {
    console.error("[REDIS] Connection error", err.message);
})
export default redis;