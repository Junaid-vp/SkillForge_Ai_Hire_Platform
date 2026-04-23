import jwt from "jsonwebtoken";
import { authCookieOptions } from "../Lib/cookieOptions.js";
import { redis } from "../Lib/redis.js";
import { randomUUID } from "crypto";
export const TokenRegenrator = async (req, res) => {
    try {
        const token = req.cookies?.Refresh_Token;
        if (!token) {
            return res.status(401).json({ message: "No Refresh_Token Founded" });
        }
        const refreshKey = process.env.REFRESH_TOKEN_KEY;
        const accessKey = process.env.ACCESS_TOKEN_KEY;
        if (!refreshKey || !accessKey) {
            throw new Error("JWT keys are not defined in environment variables");
        }
        const decode = jwt.verify(token, refreshKey);
        if (!decode.Id || !decode.Jti) {
            return res.status(401).json({ Message: "Invalid refresh token" });
        }
        const currentJti = await redis.get(`refresh:hr:${decode.Id}`);
        if (!currentJti || currentJti !== decode.Jti) {
            return res.status(401).json({ Message: "Refresh token revoked" });
        }
        const nextJti = randomUUID();
        const payload = {
            Email: decode.Email,
            Id: decode.Id,
            Jti: nextJti,
        };
        const RefreshToken = jwt.sign(payload, refreshKey, {
            expiresIn: "7d",
        });
        const AccessToken = jwt.sign(payload, accessKey, {
            expiresIn: "15m",
        });
        await redis.set(`refresh:hr:${decode.Id}`, nextJti, { EX: 7 * 24 * 60 * 60 });
        res
            .cookie("Access_Token", AccessToken, authCookieOptions)
            .cookie("Refresh_Token", RefreshToken, authCookieOptions)
            .json({ Message: "SuccessFuly Regenrator Access_Token" });
    }
    catch (e) {
        res.status(401).json({ Message: "Refresh token expired" });
    }
};
