import { logger } from "../../System/utils/logger.js";
import { createClient } from "redis";
export const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redis.on("error", (err) => {
    logger.info(err, "Error In Redis");
});
export const startRedisServer = async () => {
    try {
        await redis.connect();
        logger.info("Redis Server is Started");
    }
    catch (e) {
        logger.info(e, "Redis Server Start Issue");
    }
};
