import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const FROM = `"SkillForge AI" <${process.env.EMAIL_USER}>`;
export const sendReportEmailService = async ({ to, subject, message, pdfBase64, pdfFileName, hrName, hrCompanyName, hrEmail }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: FROM,
            to,
            replyTo: hrEmail || undefined,
            subject,
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#2563eb,#4f46e5);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2563eb;border-radius:10px;padding:8px 12px;">
                    <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;display:block;">SKILLFORGE AI</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:0 48px 40px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.2px;">Update Regarding Your Interview</h1>
              
              <div style="font-size:15px;line-height:1.7;color:#334155;white-space:pre-wrap;margin-bottom:32px;">
${message.replace(/\n/g, "<br/>")}
              </div>

              ${pdfBase64 ? `
              <!-- Attachment Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:18px;padding-right:12px;color:#0369a1;">&#128206;</td>
                        <td>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#0369a1;">${pdfFileName ?? "Interview_Report.pdf"}</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#0ea5e9;">Included as an attachment</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 48px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                Sent by <strong style="color:#334151;">${hrName ?? "Team HR"}</strong>
                ${hrCompanyName ? `from <strong style="color:#334151;">${hrCompanyName}</strong>` : ""}
                via SkillForge AI
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">
                © 2026 SkillForge AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
        };
        if (pdfBase64 && pdfFileName) {
            mailOptions.attachments = [
                {
                    filename: pdfFileName,
                    content: pdfBase64,
                    encoding: "base64",
                },
            ];
        }
        await transporter.sendMail(mailOptions);
    }
    catch (e) {
        console.error("Email sending error:", e);
        throw e;
    }
};
