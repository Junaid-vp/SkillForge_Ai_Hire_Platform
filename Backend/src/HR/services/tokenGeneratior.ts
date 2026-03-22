import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayload } from "../Lib/type.js";

dotenv.config();


export const tokenGenerator = (email: string, id: string) => {

  const refreshKey = process.env.REFRESH_TOKEN_KEY;
  const accessKey = process.env.ACCESS_TOKEN_KEY;

  if (!refreshKey || !accessKey) {
    throw new Error("JWT keys are not defined in environment variables");
  }

  const payload: JwtPayload = {
    Email: email,
    Id:id
  };

  const RefreshToken : string = jwt.sign(payload, refreshKey, {
    expiresIn: "7d",
  });

  const AccessToken : string = jwt.sign(payload, accessKey, {
    expiresIn: "1h",
  });

  return { RefreshToken, AccessToken };
};



// Stripe
// rebbitmq kafka