import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
export const sentOTPemail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: `"SkillForge AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code — SkillForge AI",
            html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
              <tr>
                <td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 8px 40px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- Accent bar -->
                    <tr>
                      <td style="height:4px;background:linear-gradient(to right,#2563eb,#4f46e5);"></td>
                    </tr>

                    <!-- Header -->
                    <tr>
                      <td style="padding:36px 48px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#2563eb;border-radius:8px;padding:7px 12px;">
                              <span style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.5px;">SkillForge AI</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                      <td style="padding:24px 48px 6px;">
                        <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Verify your identity</h1>
                        <p style="margin:10px 0 0;font-size:14px;color:#64748b;line-height:1.7;">
                          A sign-in attempt requires verification. Enter the code below — it expires in <strong style="color:#0f172a;">5 minutes</strong>.
                        </p>
                      </td>
                    </tr>

                    <!-- OTP -->
                    <tr>
                      <td style="padding:28px 48px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                          <tr>
                            <td style="padding:28px;text-align:center;">
                              <p style="margin:0 0 8px;font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:0.15em;text-transform:uppercase;">One-time code</p>
                              <p style="margin:0;font-size:40px;font-weight:800;color:#2563eb;letter-spacing:0.3em;font-variant-numeric:tabular-nums;">${otp}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding:0 48px;">
                        <hr style="border:none;border-top:1px solid #f1f5f9;margin:0;" />
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 48px 36px;">
                        <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;line-height:1.6;">
                          If you didn't attempt to sign in, please ignore this email or contact support if you have concerns.
                        </p>
                        <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 SkillForge AI. All rights reserved.</p>
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
    }
    catch (e) {
        console.log("Email sending error:", e);
        throw e;
    }
};
// import dotenv from 'dotenv'
// import { Resend } from 'resend';
// dotenv.config()
// const resend = new Resend(process.env.RESEND_API_KEY);
// export const sentOTPemail = async (email: string, otp: string) => {
//     console.log(otp);
//   try {
//      await resend.emails.send({
//     from: process.env.EMAIL_FROM!,
//     to: email,
//     subject: "Your Login OTP",
//     html: `<h2>Your OTP is: ${otp}</h2>`,
//   });
//   } catch (e) {
//     console.log("Email sending error:", e);
//     throw e;
//   }
// }
