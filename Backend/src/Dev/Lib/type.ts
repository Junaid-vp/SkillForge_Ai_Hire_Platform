// JwtPayload

export interface JwtPayloadDev {
  Email?: string;
  Id: string;
}


declare global {
  namespace Express {
    interface Request {
      devId?: string;
    }
  }
}