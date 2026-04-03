const isProduction = process.env.NODE_ENV === "production";
export const authCookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
};
