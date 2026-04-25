import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const tokenGenerator = (email, id) => {
    const refreshKey = process.env.REFRESH_TOKEN_KEY;
    const accessKey = process.env.ACCESS_TOKEN_KEY;
    if (!refreshKey || !accessKey) {
        throw new Error("JWT keys are not defined in environment variables");
    }
    const payload = {
        Email: email,
        Id: id
    };
    const RefreshToken = jwt.sign(payload, refreshKey, {
        expiresIn: "7d",
    });
    const AccessToken = jwt.sign(payload, accessKey, {
        expiresIn: "1h",
    });
    return { RefreshToken, AccessToken };
};
// Stripe
// rebbitmq kafka
