import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatTime = (t: string) => {
  if (!t?.includes(":")) return t;
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};


// ── HR Reminder Email ─────────────────────────────────────────────────────────
export const sendInterviewReminderEmail = async ({
  to,
  hrName,
  developerName,
  intervalLabel,
  interviewId,
  startTime,
}: {
  to: string;
  hrName: string;
  developerName: string;
  intervalLabel: string;
  interviewId: string;
  startTime: string;
}) => {
  const joinUrl = `${process.env.FRONTEND_URL}/HrInterviewRoom/${interviewId}?role=HR&name=${encodeURIComponent(hrName)}`;
  const time = formatTime(startTime);

  const html = `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header band -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.3px;">SkillForge AI</span>
                    </div>
                    <p style="margin:12px 0 0 0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;">HR Portal · Interview Reminder</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;">
                      ${intervalLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">

              <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                Interview Starting Soon
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#64748b;line-height:1.6;">
                Hi <strong style="color:#0f172a;">${hrName}</strong>, your scheduled interview is coming up. Here's everything you need.
              </p>

              <!-- Info card -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:14px;border-bottom:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Candidate</p>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:700;color:#0f172a;">${developerName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Scheduled Time</p>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:700;color:#0f172a;">${time}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Checklist -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:18px 22px;margin-bottom:28px;">
                <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;color:#1e40af;letter-spacing:0.06em;text-transform:uppercase;">Before you join</p>
                <table cellpadding="0" cellspacing="0">
                  ${[
      "Open the interview room a minute early",
      "Ensure your camera and microphone are working",
      "Questions are generated automatically from candidate's skills",
      "You can take notes and view AI scores in real time",
    ].map(tip => `
                  <tr>
                    <td style="padding:4px 0;vertical-align:top;">
                      <span style="color:#2563eb;font-size:13px;padding-right:10px;">→</span>
                    </td>
                    <td style="padding:4px 0;">
                      <span style="font-size:13px;color:#1e3a8a;line-height:1.5;">${tip}</span>
                    </td>
                  </tr>`).join("")}
                </table>
              </div>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);">
                    <a href="${joinUrl}"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:-0.2px;">
                      Join Interview Room &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8;">
                Or copy this link: <span style="color:#2563eb;">${joinUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.7;">
                This reminder was sent because an interview is scheduled on your SkillForge AI account.<br/>
                © 2026 SkillForge AI &nbsp;·&nbsp; All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SkillForge AI" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Interview in ${intervalLabel} — ${developerName}`,
      html,
    });
  } catch (e: any) {
    console.error("HR reminder email error:", e.message);
  }
};


// ── Developer Reminder Email ──────────────────────────────────────────────────
export const sendDeveloperReminderEmail = async ({
  to,
  developerName,
  hrName,
  companyName,
  intervalLabel,
  startTime,
}: {
  to: string;
  developerName: string;
  hrName: string;
  companyName: string;
  intervalLabel: string;
  interviewId: string;
  startTime: string;
}) => {
  const dashUrl = `${process.env.FRONTEND_URL}/devDashboard`;
  const time = formatTime(startTime);

  const html = `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header band — different color for dev -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.3px;">SkillForge AI</span>
                    </div>
                    <p style="margin:12px 0 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;">Developer · Interview Reminder</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;">
                      ${intervalLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">

              <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                Your Interview is Coming Up
              </h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#64748b;line-height:1.6;">
                Hi <strong style="color:#0f172a;">${developerName}</strong>, this is your reminder. You're almost there — here's what you need to know.
              </p>

              <!-- Info card -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:14px;border-bottom:1px solid #e2e8f0;" width="50%">
                      <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Interviewer</p>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:700;color:#0f172a;">${hrName}</p>
                    </td>
                    <td style="padding-bottom:14px;border-bottom:1px solid #e2e8f0;" width="50%">
                      <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Company</p>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:700;color:#0f172a;">${companyName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:14px;">
                      <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Starts At</p>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:700;color:#0f172a;">${time} &nbsp;<span style="font-size:13px;color:#64748b;font-weight:500;">· in ${intervalLabel}</span></p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What to expect -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px 22px;margin-bottom:28px;">
                <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;">What to expect</p>
                <table cellpadding="0" cellspacing="0">
                  ${[
      "Live video interview with camera + microphone",
      "AI-generated technical questions based on your skills",
      "A timed coding challenge in an embedded code editor",
      "Instant AI evaluation — results shared with HR",
    ].map(tip => `
                  <tr>
                    <td style="padding:4px 0;vertical-align:top;">
                      <span style="color:#16a34a;font-size:13px;padding-right:10px;">✓</span>
                    </td>
                    <td style="padding:4px 0;">
                      <span style="font-size:13px;color:#166534;line-height:1.5;">${tip}</span>
                    </td>
                  </tr>`).join("")}
                </table>
              </div>

              <!-- Quick tips -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:18px 22px;margin-bottom:28px;">
                <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">Quick tips</p>
                <table cellpadding="0" cellspacing="0">
                  ${[
      "Allow camera & microphone when prompted",
      "Use a stable internet connection",
      "Find a quiet space with good lighting",
      "Log in via your developer dashboard link",
    ].map(tip => `
                  <tr>
                    <td style="padding:4px 0;vertical-align:top;">
                      <span style="color:#d97706;font-size:13px;padding-right:10px;">→</span>
                    </td>
                    <td style="padding:4px 0;">
                      <span style="font-size:13px;color:#78350f;line-height:1.5;">${tip}</span>
                    </td>
                  </tr>`).join("")}
                </table>
              </div>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#0f172a,#334155);">
                    <a href="${dashUrl}"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:-0.2px;">
                      Go to Dashboard &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Good luck, ${developerName.split(" ")[0]}!The SkillForge AI team is rooting for you.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.7;">
                This reminder was sent because you have an interview scheduled via SkillForge AI.<br/>
                © 2026 SkillForge AI &nbsp;·&nbsp; All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SkillForge AI" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⏰ Your interview with ${companyName} starts in ${intervalLabel}`,
      html,
    });
  } catch (e: any) {
    console.error("Developer reminder email error:", e.message);
  }
};