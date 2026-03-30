import jwt from "jsonwebtoken";
export const TokenRegenrator = (req, res) => {
    try {
        let token = req.cookies?.Refresh_Token;
        if (!token) {
            return res.status(401).json({ message: "No Refresh_Token Founded" });
        }
        const refreshKey = process.env.REFRESH_TOKEN_KEY;
        const accessKey = process.env.ACCESS_TOKEN_KEY;
        if (!refreshKey || !accessKey) {
            throw new Error("JWT keys are not defined in environment variables");
        }
        const decode = jwt.verify(token, refreshKey);
        const payload = {
            Email: decode.Email,
            Id: decode.Id,
        };
        const RefreshToken = jwt.sign(payload, refreshKey, {
            expiresIn: "7d",
        });
        const AccessToken = jwt.sign(payload, accessKey, {
            expiresIn: "15m",
        });
        res
            .cookie("Access_Token", AccessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
            .cookie("Refresh_Token", RefreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
            .json({ Message: "SuccessFuly Regenrator Access_Token" });
    }
    catch (e) {
        res.status(401).json({ Message: "Refresh token expired" });
    }
};
