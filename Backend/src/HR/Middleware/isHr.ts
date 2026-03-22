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
    console.error(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isHr;
