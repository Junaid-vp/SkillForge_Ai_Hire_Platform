// src/Pages/PrivacyPage.tsx
import { Shield, Lock, Eye, FileText, Globe, Scale, ArrowLeft, Clock, CheckCircle2 } from "lucide-react"
import { Logo, Bolt } from "../HR/Components/Icons"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const LAST_UPDATED = "April 2026"
const EMAIL        = "skillforgeoffical@gmail.com"

export default function PrivacyPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo onClick={() => navigate("/")} className="cursor-pointer" />
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"><ArrowLeft size={12}/> Back to Home</button>
            <button onClick={() => navigate("/about")}   className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">About</button>
            <button onClick={() => navigate("/contact")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Contact</button>
            <button onClick={() => navigate("/login")}   className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
          <Bolt size={10} className="text-blue-600" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Privacy Policy</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Privacy & Data Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Summary:</strong> SkillForge AI collects only the data necessary to run
            technical interviews. We do not sell your data. HR companies own their candidate data.
            Developers' data is deleted after interview completion upon request. We use industry-standard
            security practices to keep your information safe.
          </p>
        </div>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">1</span>
              Who We Are
            </h2>
            <p>
              SkillForge AI is an AI-powered technical interview platform that helps HR teams
              conduct, evaluate, and report on developer interviews. We operate the platform
              accessible at this domain and related services.
            </p>
            <p className="mt-3">
              For privacy-related enquiries, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline font-medium">{EMAIL}</a>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">2</span>
              What Data We Collect
            </h2>

            <p className="font-semibold text-gray-900 mb-2 mt-4">For HR Users (Companies):</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li>Name, email address, and company name (used for account and notifications)</li>
              <li>Interview schedule details and interview history</li>
              <li>Task library content you create</li>
              <li>Payment information (processed securely by Stripe — we never store card numbers)</li>
              <li>Notification preferences and settings</li>
            </ul>

            <p className="font-semibold text-gray-900 mb-2 mt-4">For Developers (Candidates):</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li>Name and email address (provided by the HR company that invited you)</li>
              <li>Resume (uploaded by HR, stored securely on Cloudinary)</li>
              <li>Interview answers, code submissions, and task ZIP files</li>
              <li>AI-generated evaluation scores and feedback</li>
              <li>Video interview session data (not recorded — live only)</li>
            </ul>

            <p className="font-semibold text-gray-900 mb-2 mt-4">Automatically Collected:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li>Browser type and device information (for technical compatibility)</li>
              <li>Session tokens stored in secure HTTP-only cookies</li>
              <li>Temporary OTP codes stored in Redis (expire in 5 minutes)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">3</span>
              AI Proctoring & Video Interviews
            </h2>
            <p>
              During live interviews, SkillForge AI runs real-time AI proctoring on the
              developer's camera feed to detect potential malpractice (tab switching, multiple
              faces, external devices, etc.).
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600 mt-3">
              <li><strong>Video is not recorded.</strong> All AI analysis happens in real time in the browser using MediaPipe — no video data is transmitted to our servers.</li>
              <li>Only violation events (type, severity, timestamp) are stored — not video frames or images.</li>
              <li>AI proctoring only activates once both HR and developer have joined the interview room.</li>
              <li>HR is notified of hard violations. Soft violations (minor head movement, eye gaze) are logged only — they do not count toward suspension warnings.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">4</span>
              How We Use Your Data
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li>To operate and deliver the SkillForge AI interview platform</li>
              <li>To generate AI evaluation reports using Groq AI (Llama 3.3-70B)</li>
              <li>To send interview invitation and reminder emails via Resend</li>
              <li>To process payments and manage subscription plans via Stripe</li>
              <li>To store files (resumes, task submissions) on Cloudinary</li>
              <li>To run code submissions against Judge0 for automated testing</li>
              <li>To provide real-time interview communication via Socket.io and PeerJS (WebRTC)</li>
              <li>We do <strong>not</strong> use your data for advertising or sell it to any third party</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">5</span>
              Third-Party Services
            </h2>
            <p className="mb-3">We use the following trusted third-party services to operate the platform:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Service</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Data Shared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    ["Groq AI",       "AI evaluation & question generation",   "Answer text, code, task content"],
                    ["Stripe",        "Payment processing",                     "Email, payment details"],
                    ["Resend",        "Email delivery (invitations, reports)",  "Name, email, PDF reports"],
                    ["Cloudinary",    "File storage (resumes, task ZIPs)",      "Uploaded files"],
                    ["Judge0",        "Code execution & testing",               "Code submissions"],
                    ["PeerJS / WebRTC","Peer-to-peer video calls",              "None stored — live only"],
                    ["Redis (Upstash)","Session tokens, OTP codes",             "Temporary tokens only"],
                  ].map(([service, purpose, data]) => (
                    <tr key={service} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{service}</td>
                      <td className="px-4 py-2.5 text-gray-600">{purpose}</td>
                      <td className="px-4 py-2.5 text-gray-500">{data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">6</span>
              Data Retention
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li><strong>HR accounts:</strong> Data retained while account is active. Deleted within 30 days of account closure.</li>
              <li><strong>Developer (candidate) data:</strong> Retained for 90 days after interview completion, then automatically deleted unless HR requests longer retention.</li>
              <li><strong>OTP codes:</strong> Expire automatically after 5 minutes (stored in Redis).</li>
              <li><strong>Magic links:</strong> Expire 7 days after the scheduled interview date.</li>
              <li><strong>Interview reports:</strong> Retained as long as the HR account is active.</li>
              <li><strong>Video calls:</strong> Never stored — peer-to-peer and live only.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">7</span>
              Cookies & Sessions
            </h2>
            <p>
              SkillForge AI uses <strong>HTTP-only secure cookies</strong> to manage login sessions
              for HR users. These are not accessible by JavaScript and cannot be read by
              third-party scripts. We do not use advertising cookies or tracking cookies.
            </p>
            <p className="mt-3">
              Developer sessions use short-lived JWT tokens tied to a specific interview.
              These tokens are cleared automatically when the interview ends or expires.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">8</span>
              Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li><strong>Access</strong> — Request a copy of your personal data we hold</li>
              <li><strong>Correction</strong> — Ask us to correct inaccurate data</li>
              <li><strong>Deletion</strong> — Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability</strong> — Receive your data in a machine-readable format</li>
              <li><strong>Objection</strong> — Object to specific uses of your data</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline font-medium">{EMAIL}</a>{" "}
              with the subject line "Data Request". We will respond within 7 business days.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">9</span>
              Data Security
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-gray-600">
              <li>All data is transmitted over HTTPS (TLS 1.2+)</li>
              <li>Passwords are hashed using bcrypt — never stored in plaintext</li>
              <li>Session tokens are stored in secure, HTTP-only cookies</li>
              <li>Database access is restricted and not publicly exposed</li>
              <li>File uploads are stored on Cloudinary with access control</li>
              <li>Redis keys use short TTLs to minimize exposure of temporary tokens</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">10</span>
              Children's Privacy
            </h2>
            <p>
              SkillForge AI is intended for professional use only. We do not knowingly collect
              data from individuals under 16 years of age. If you believe a minor has provided
              us with personal data, please contact us immediately at{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline font-medium">{EMAIL}</a>.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">11</span>
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update
              the "Last updated" date at the top of this page. For significant changes, we will
              notify HR account holders by email. Continued use of the platform after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">12</span>
              Contact & Questions
            </h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data,
              please reach out to us:
            </p>
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-bold text-gray-900 mb-1">SkillForge AI</p>
              <p className="text-sm text-gray-600">
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline font-medium">{EMAIL}</a>
              </p>
              <p className="text-xs text-gray-400 mt-1">Response time: within 24–48 hours on business days</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Logo />
          <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} SkillForge AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/about")}   className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">About</button>
            <button onClick={() => navigate("/contact")} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  )
}