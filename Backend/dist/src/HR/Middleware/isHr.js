import { logger } from "../../System/utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const isHr = (req, res, next) => {
    try {
        const token = req.cookies?.Access_Token;
        if (!token) {
            return res
                .status(401)
                .json({ message: "Unauthorized, Please login first" });
        }
        const accessKey = process.env.ACCESS_TOKEN_KEY;
        if (!accessKey) {
            throw new Error("JWT key is not defined");
        }
        const decode = jwt.verify(token, accessKey);
        req.userId = decode.Id;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Access token expired",
                code: "TOKEN_EXPIRED",
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid token",
                code: "INVALID_TOKEN",
            });
        }
        logger.error({ err: error }, "HR auth middleware error");
        return res.status(401).json({ message: "Unauthorized" });
    }
};
export default isHr;
