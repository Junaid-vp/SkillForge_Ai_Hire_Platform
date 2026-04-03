import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JwtPayload } from "../Lib/type.js";
import { authCookieOptions } from "../Lib/cookieOptions.js";

export const TokenRegenrator = (req: Request, res: Response) => {
  try {
    let token : string  = req.cookies?.Refresh_Token
      if (!token) {
      return res.status(401).json({ message: "No Refresh_Token Founded" });
    }

    const refreshKey = process.env.REFRESH_TOKEN_KEY;
    const accessKey = process.env.ACCESS_TOKEN_KEY;

    if (!refreshKey || !accessKey) {
      throw new Error("JWT keys are not defined in environment variables");
    }
   
    const decode = jwt.verify(token, refreshKey) as JwtPayload;

    const payload: JwtPayload = {
      Email: decode.Email,
      Id: decode.Id,
    };

    const RefreshToken : string  = jwt.sign(payload, refreshKey, {
      expiresIn: "7d",
    });

    const AccessToken : string  = jwt.sign(payload, accessKey, {
      expiresIn: "15m",
    });

    res
      .cookie("Access_Token", AccessToken, authCookieOptions)
      .cookie("Refresh_Token", RefreshToken, authCookieOptions)
      .json({ Message: "SuccessFuly Regenrator Access_Token" });
  } catch (e) {
    res.status(401).json({ Message: "Refresh token expired" });
  }
};
