import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const tokenGeneratorDev = (email, id) => {
    const accessKey = process.env.ACCESS_TOKEN_KEY;
    if (!accessKey) {
        throw new Error("JWT keys are not defined in environment variables");
    }
    const payload = {
        Email: email,
        Id: id
    };
    const AccessToken = jwt.sign(payload, accessKey, {
        expiresIn: "7d",
    });
    return { AccessToken };
};
