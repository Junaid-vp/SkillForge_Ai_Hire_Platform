import { logger } from "../../System/utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../Lib/type.js";

dotenv.config();

const isHr = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string = req.cookies?.Access_Token;


    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, Please login first" });
    }

    const accessKey  = process.env.ACCESS_TOKEN_KEY;

    if (!accessKey) {
      throw new Error("JWT key is not defined");
    }

    const decode = jwt.verify(token, accessKey) as JwtPayload;

    req.userId = decode.Id;

    next();
  } catch (error) {
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

    logger.error("HR auth middleware error", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isHr;
