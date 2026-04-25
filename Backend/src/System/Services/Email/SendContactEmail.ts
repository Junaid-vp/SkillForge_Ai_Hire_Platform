import { logger } from "../../utils/logger.js";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export const sendContactEmail = async (name: string, email: string, subject: string, message: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 8px 40px rgba(0,0,0,0.08);overflow:hidden;text-align:left;">
                
                <!-- Accent bar -->
                <tr>
                  <td style="height:4px;background:linear-gradient(to right,#2563eb,#4f46e5);"></td>
                </tr>

                <!-- Header -->
                <tr>
                  <td style="padding:36px 48px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#eff6ff;border-radius:8px;padding:7px 12px;border:1px solid #bfdbfe;">
                          <span style="color:#2563eb;font-size:12px;font-weight:700;">Support Ticket</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Title & Meta -->
                <tr>
                  <td style="padding:24px 48px 24px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">
                      ${subject || "New Message Received"}
                    </h1>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;padding:16px 0;">
                      <tr>
                        <td style="width:70px;padding-top:4px;padding-bottom:4px;">
                          <span style="font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">From</span>
                        </td>
                        <td style="padding-top:4px;padding-bottom:4px;">
                          <span style="font-size:14px;color:#0f172a;font-weight:600;">${name}</span>
                          <span style="font-size:14px;color:#64748b;margin-left:4px;">&lt;${email}&gt;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message Body -->
                <tr>
                  <td style="padding:0 48px 36px;">
                    <span style="font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:12px;">Message</span>
                    <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:24px;font-size:15px;line-height:1.6;color:#334155;white-space:pre-wrap;">${message}</div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:24px 48px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      This message was sent from the SkillForge AI Contact Form.<br/>
                      To respond, simply reply directly to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
      `
    });
  } catch (e) {
    logger.error({ err: e }, "Email sending error");
    throw e;
  }
}
