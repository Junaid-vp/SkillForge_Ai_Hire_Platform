import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { redis } from "../Lib/redis.js";
dotenv.config();
export const tokenGenerator = async (email, id) => {
    const refreshKey = process.env.REFRESH_TOKEN_KEY;
    const accessKey = process.env.ACCESS_TOKEN_KEY;
    if (!refreshKey || !accessKey) {
        throw new Error("JWT keys are not defined in environment variables");
    }
    const payload = {
        Email: email,
        Id: id,
        Jti: randomUUID(),
    };
    const RefreshToken = jwt.sign(payload, refreshKey, {
        expiresIn: "7d",
    });
    const AccessToken = jwt.sign(payload, accessKey, {
        expiresIn: "1h",
    });
    await redis.set(`refresh:hr:${id}`, payload.Jti, { EX: 7 * 24 * 60 * 60 });
    return { RefreshToken, AccessToken };
};
// Stripe
// rebbitmq kafka
