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
        console.error(error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
export default isHr;
