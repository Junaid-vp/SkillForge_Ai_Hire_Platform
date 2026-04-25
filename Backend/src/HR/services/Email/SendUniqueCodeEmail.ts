import { logger } from "../../../System/utils/logger.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendUniqueCode = async (
  developerName: string,
  developerEmail: string,
  position: string,
  UniqueCode: string,
  interviewDate: string,
  interviewTime: string,
  email: string | undefined,
  companyName: string | undefined,
  name: string | undefined,
  magicLink: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const dateObj = new Date(interviewDate);
    const formattedDate = isNaN(dateObj.getTime())
      ? interviewDate
      : dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const formatTime = (t: string) => {
      if (!t?.includes(":")) return t;
      const [h, m] = t.split(":").map(Number);
      return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    };

    logger.info("Sending Schedule Email With Transporter...");
    logger.info({ developerEmail }, "Sending to recipient");

    await transporter.sendMail({
      from: `"${companyName ?? "SkillForge AI"}" <${process.env.EMAIL_USER}>`,
      to: developerEmail,
      subject: `Interview Invitation — ${position} at ${companyName ?? "SkillForge AI"}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0">

  <!-- Logo -->
  <tr><td align="center" style="padding-bottom:28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#1d4ed8;border-radius:8px;padding:8px 11px;">
        <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:0.3px;">SkillForge AI</span>
    </tr></table>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.07);">

    <!-- Hero banner -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%);padding:40px 48px 36px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#bfdbfe;">You're Invited</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">Interview Invitation</h1>
          <p style="margin:0;font-size:14px;color:#93c5fd;line-height:1.6;">${position} &nbsp;·&nbsp; ${companyName ?? "SkillForge AI"}</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:36px 48px;">

      <!-- Greeting -->
      <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a;">Dear ${developerName},</p>
      <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.8;">
        <strong style="color:#0f172a;">${name ?? "Our HR Team"}</strong> from
        <strong style="color:#0f172a;">${companyName}</strong> has scheduled an interview for you
        on the <strong style="color:#1d4ed8;">SkillForge AI</strong> platform. Your interview will include
        an <strong style="color:#0f172a;">HR round</strong> followed by a <strong style="color:#0f172a;">technical assessment</strong>.
      </p>

      <!-- Schedule box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="padding:14px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Schedule</p>
        </td></tr>
        <tr>
          <td style="padding:18px 20px;border-bottom:1px solid #f1f5f9;">
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Date</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${formattedDate}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px;border-bottom:1px solid #f1f5f9;">
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Time</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${formatTime(interviewTime)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Invited By</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${name ?? "HR Team"}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${email ?? ""}</p>
          </td>
        </tr>
      </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr><td align="center">
    <a href="${magicLink}"
       style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:10px;box-shadow:0 4px 15px rgba(29,78,216,0.25);">
    Click And Enter Interview Dashboard
    </a>  
  </td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
  <tr><td align="center" style="padding-bottom:12px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;">OR JOIN MANUALLY</p>
  </td></tr>
  <tr><td style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:20px;text-align:center;">
    <p style="margin:0;font-size:13px;color:#475569;">
      If the button fails, visit <strong>SkillForge AI</strong> and enter:
    </p>
    <p style="margin:8px 0 0;font-size:15px;color:#0f172a;">
      <strong>Email:</strong> ${developerEmail}<br/>
      <strong>Access Code:</strong> <span style="font-family:monospace;font-weight:800;color:#1d4ed8;">${UniqueCode}</span>
    </p>
  </td></tr>
</table>

      <!-- Notice -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr><td style="background:#fefce8;border-left:3px solid #eab308;border-radius:0 8px 8px 0;padding:13px 16px;">
          <p style="margin:0;font-size:12px;color:#713f12;line-height:1.7;">
            <strong>Please note:</strong> This code is personal . Do not share it.
            Join on time — late access may not be accommodated.
          </p>
        </td></tr>
      </table>

      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="border-top:1px solid #f1f5f9;"></td></tr>
      </table>

      <!-- Sign off -->
      <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.8;">
        Should you have any questions, please reach out to
        <a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;font-weight:500;">${email ?? ""}</a>.
        We look forward to speaking with you.
      </p>
      <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.8;">
        Warm regards,<br/>
        <strong>${name ?? "The HR Team"}</strong><br/>
        <span style="font-size:13px;color:#64748b;">${companyName ?? "SkillForge AI"}</span>
      </p>

    </td></tr></table>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:24px 0 0;">
    <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Sent via <strong style="color:#64748b;">SkillForge AI</strong> on behalf of ${companyName ?? "the hiring team"}</p>
    <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 SkillForge AI · All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`,
    });
  } catch (e) {
    logger.error({ err: e }, "Email sending error");
    throw e;
  }
};
