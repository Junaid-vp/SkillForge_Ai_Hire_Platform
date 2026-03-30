import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export const sendResheduledTime = async (
  developerName: string,
  developerEmail: string,
  position: string,
  UniqueCode: string,
  email: string | undefined,
  companyName: string | undefined,
  name: string | undefined,
  newTime: string,
  newDate: string,
  magicLink:string,
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const dateObj = new Date(newDate);
    const formattedDate = isNaN(dateObj.getTime()) ? newDate
      : dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const formatTime = (t: string) => {
      if (!t?.includes(':')) return t;
      const [h, m] = t.split(':').map(Number);
      return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    console.log("Sending Reschedule Email With Transporter...");
    console.log("To:", developerEmail);

  const info =   await transporter.sendMail({
      from: `"${companyName ?? 'SkillForge AI'}" <${process.env.EMAIL_USER}>`,
      to: developerEmail,
      subject: `Interview Rescheduled — ${position} at ${companyName ?? 'SkillForge AI'}`,
       text: `Your code: ${UniqueCode}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Interview Rescheduled - SkillForge AI</title>
  <style>
    @media only screen and (max-width: 560px) {
      .button { padding: 12px 28px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 8px 40px rgba(0,0,0,0.06);overflow:hidden;">

          <!-- Accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#f59e0b,#ef4444);">       </td>
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
              <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="background:#fef3c7;border:1px solid #fde68a;border-radius:999px;padding:4px 12px;">
                    <span style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.15em;">Interview Rescheduled</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Your interview has been rescheduled</h1>
              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
                Dear <strong style="color:#0f172a;">${developerName}</strong>, your interview for the
                <strong style="color:#0f172a;">${position}</strong> role at
                <strong style="color:#0f172a;">${companyName ?? 'our company'}</strong> has been moved to a new time.
              </p>
            </td>
          </tr>

          <!-- New Schedule Box -->
          <tr>
            <td style="padding:24px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:13px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Updated Schedule</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;border-bottom:1px solid #f1f5f9;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">New Date</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${formattedDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;border-bottom:1px solid #f1f5f9;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">New Time</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${formatTime(newTime)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Rescheduled By</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${name ?? 'HR Team'}</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${email ?? ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Magic Link Button -->
          <tr>
            <td style="padding:0 48px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${magicLink}"
                       style="display:inline-block; background:#2563eb; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 42px; border-radius:10px; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                      Access Interview Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Manual Access Box (Styled like Schedule Box) -->
          <tr>
            <td style="padding:0 48px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:13px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Manual Access</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:13px;color:#475569;">
                      If the button doesn't work, use these credentials:
                    </p>
                    <p style="margin:0;font-size:13px;color:#0f172a;">
                      <strong>Email:</strong> ${developerEmail}<br><br>
                      <strong>Access Code:</strong><br>
                      <span style="display:inline-block; background:#eff6ff; padding:10px 20px; border-radius:8px; font-family:monospace; font-size:20px; font-weight:800; color:#2563eb; margin-top:8px; border:1px solid #bfdbfe; letter-spacing:0.1em;">${UniqueCode}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding:0 48px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:13px 16px;">
                    <p style="margin:0;font-size:12px;color:#78350f;line-height:1.7;">
                      <strong>Please note:</strong> Only the date and time have changed. Your access code and interview details remain the same. Please join on time.
                    </p>
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
              <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.8;">
                For any questions, contact <strong>${name ?? 'our HR team'}</strong> at
                <a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;">${email ?? ''}</a>.
              </p>
              <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.8;">
                Warm regards,<br/>
                <strong>${name ?? 'The HR Team'}</strong><br/>
                <span style="font-size:13px;color:#64748b;">${companyName ?? 'SkillForge AI'}</span>
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="480" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td align="center">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Sent via <strong style="color:#64748b;">SkillForge AI</strong> on behalf of ${companyName ?? 'the hiring team'}</p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 SkillForge AI · All rights reserved.</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`
    });

    console.log("Message sent:", info.messageId);
console.log("Response:", info.response);

  } catch (e) {
    console.error('Failed to send reschedule email:', e);
    throw e;
  }
};