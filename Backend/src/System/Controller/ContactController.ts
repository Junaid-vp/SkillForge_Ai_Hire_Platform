import { Request, Response } from "express";
import { sendContactEmail } from "../Services/Email/SendContactEmail.js";

export const contactController = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ Message: "Missing required fields" });
        }

        await sendContactEmail(name, email, subject, message);

        return res.status(200).json({ Message: "Message sent successfully" });
    } catch (e: any) {
        return res.status(500).json({ Message: "Server Error", Error: e.message });
    }
}
