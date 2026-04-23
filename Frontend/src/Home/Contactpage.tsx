// src/Pages/ContactPage.tsx
import { useState, useEffect } from "react"
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { Logo, Bolt } from "../HR/Components/Icons"
import { useNavigate } from "react-router-dom"
import { api } from "../Api/Axios"

export default function ContactPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ name: "", email: "", subject: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setSending(true)
    try {
      await api.post("/system/contact", form)
      setSent(true)
    } catch (e: any) {
      setError(e.response?.data?.Message || "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo onClick={() => navigate("/")} className="cursor-pointer" />
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"><ArrowLeft size={12}/> Back to Home</button>
            <button onClick={() => navigate("/about")}   className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">About</button>
            <button onClick={() => navigate("/privacy")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Privacy</button>
            <button onClick={() => navigate("/login")}   className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
          <Bolt size={10} className="text-blue-600" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Contact Us</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
          We'd love to hear from you
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          Have a question, found a bug, or want to know more about SkillForge AI?
          We typically respond within 24 hours.
        </p>
      </section>

      {/* Main content */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left — Info */}
          <div className="space-y-4">
            {[
              {
                icon:  <Mail size={15} className="text-blue-500" />,
                title: "Email Us",
                line1: "skillforgeoffical@gmail.com",
                line2: "General enquiries & support",
              },
              {
                icon:  <MessageSquare size={15} className="text-purple-500" />,
                title: "Bug Reports",
                line1: "skillforgeoffical@gmail.com",
                line2: "Subject: Bug Report",
              },
              {
                icon:  <Clock size={15} className="text-green-500" />,
                title: "Response Time",
                line1: "Within 24 hours",
                line2: "Monday to Friday",
              },
            ].map(({ icon, title, line1, line2 }) => (
              <div key={title} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">{icon}</div>
                  <p className="text-xs font-bold text-gray-900">{title}</p>
                </div>
                <p className="text-xs text-gray-700 font-medium break-all">{line1}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{line2}</p>
              </div>
            ))}

            {/* Common topics */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-800 mb-2">Common Topics</p>
              <ul className="space-y-1.5">
                {[
                  "How to schedule an interview",
                  "Upgrading to Pro plan",
                  "Developer login issues",
                  "PDF report generation",
                  "Cancelling subscription",
                  "Intern module updates",
                ].map(item => (
                  <li key={item} className="text-[11px] text-blue-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="border border-green-200 bg-green-50 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-white border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green-500" />
                </div>
                <p className="text-base font-bold text-green-800 mb-2">Message Sent!</p>
                <p className="text-sm text-green-600 leading-relaxed">
                  Thank you, {form.name}! We've received your message and will
                  get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }) }}
                  className="mt-6 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-gray-100 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-bold text-gray-900">Send us a message</p>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@email.com"
                      className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="General Question">General Question</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Plans">Billing & Plans</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Intern Module">Intern Module (Coming Soon)</option>
                    <option value="Enterprise Enquiry">Enterprise Enquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  {sending
                    ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                    : <><Send size={14} /> Send Message</>
                  }
                </button>
                <p className="text-[11px] text-gray-400 text-center">
                  By submitting, you agree to our{" "}
                  <button type="button" onClick={() => navigate("/privacy")} className="text-blue-500 hover:underline">
                    Privacy Policy
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Logo />
          <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} SkillForge AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/about")}   className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">About</button>
            <button onClick={() => navigate("/privacy")} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  )
}