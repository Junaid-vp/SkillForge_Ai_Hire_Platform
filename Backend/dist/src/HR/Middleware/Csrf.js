import crypto from "crypto";
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
const hasAuthCookies = (req) => Boolean(req.cookies?.Access_Token ||
    req.cookies?.Refresh_Token ||
    req.cookies?.Dev_Access_Token);
const getRequestOrigin = (req) => {
    const origin = req.get("origin");
    if (origin)
        return origin;
    const referer = req.get("referer");
    if (!referer)
        return "";
    try {
        return new URL(referer).origin;
    }
    catch {
        return "";
    }
};
export const attachCsrfToken = (req, res, next) => {
    if (!req.cookies?.["XSRF-TOKEN"]) {
        const token = crypto.randomBytes(24).toString("hex");
        res.cookie("XSRF-TOKEN", token, {
            httpOnly: false,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });
    }
    next();
};
export const csrfProtection = (req, res, next) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method))
        return next();
    // We only enforce CSRF checks for cookie-authenticated requests.
    if (!hasAuthCookies(req))
        return next();
    const requestOrigin = getRequestOrigin(req);
    if (!requestOrigin || requestOrigin !== frontendUrl) {
        return res.status(403).json({ Message: "Invalid request origin" });
    }
    const cookieToken = req.cookies?.["XSRF-TOKEN"];
    const headerToken = req.get("x-csrf-token");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ Message: "Invalid CSRF token" });
    }
    next();
};
