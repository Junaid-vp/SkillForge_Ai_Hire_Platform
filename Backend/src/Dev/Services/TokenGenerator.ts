import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayload } from "../../HR/Lib/type.js";
import { JwtPayloadDev } from "../Lib/type.js";


dotenv.config();


export const tokenGeneratorDev = (email: string, id: string) => {

  
  const accessKey = process.env.ACCESS_TOKEN_KEY;

  if ( !accessKey) {
    throw new Error("JWT keys are not defined in environment variables");
  }

  const payload: JwtPayloadDev = {
    Email: email,
    Id:id
  };

  const AccessToken : string = jwt.sign(payload, accessKey, {
    expiresIn: "7d",
  });

  return { AccessToken };
};

