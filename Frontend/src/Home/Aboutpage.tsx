// src/Pages/AboutPage.tsx
import { Brain, Shield, Zap, Users, Target, CheckCircle2, Clock, ArrowLeft, Sparkles } from "lucide-react"
import { Logo, Bolt } from "../HR/Components/Icons"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function AboutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <Logo onClick={() => navigate("/")} className="cursor-pointer" />
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"><ArrowLeft size={12}/> Back to Home</button>
            <button onClick={() => navigate("/contact")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Contact</button>
            <button onClick={() => navigate("/privacy")} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Privacy</button>
            <button onClick={() => navigate("/login")}   className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
          <Bolt size={10} className="text-blue-600" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">About SkillForge AI</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-5">
          We're building the future<br />of technical hiring
        </h1>
        <p className="text-base text-gray-500 leading-relaxed max-w-2xl mx-auto">
          SkillForge AI combines real-time video interviews, AI-powered question generation,
          automated code assessment, intelligent task evaluation, and proctoring — all in one platform.
          Built for HR teams and developers who value speed, accuracy, and fairness.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 mb-3">Our Mission</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                Make technical hiring fair, fast, and intelligent
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Traditional hiring is broken. HR teams spend hours scheduling interviews,
                manually reviewing code, and writing evaluation reports — leaving less time
                to actually find the right people.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                SkillForge AI automates the repetitive parts so HR can focus on what matters:
                genuine human connection and accurate hiring decisions backed by real data.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: <Brain size={15} className="text-blue-500" />,
                  title: "AI-Powered Interviews",
                  desc:  "Auto-generate 15 technical questions tailored to each developer's skills, position, and experience level.",
                },
                {
                  icon: <Shield size={15} className="text-green-500" />,
                  title: "Smart AI Proctoring",
                  desc:  "Real-time malpractice detection using MediaPipe face and object detection — fair for honest candidates.",
                },
                {
                  icon: <Zap size={15} className="text-purple-500" />,
                  title: "Instant Evaluation",
                  desc:  "Groq AI (Llama 3.3-70B) evaluates every answer, code submission, and take-home task in seconds.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">{icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">Who It's For</p>
            <h2 className="text-2xl font-bold text-gray-900">Three types of users. One platform.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* HR */}
            <div className="border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">HR Teams</p>
                  <p className="text-[10px] text-green-600 font-semibold">✓ Available Now</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Schedule interviews in minutes",
                  "Resume parsing with AI autofill",
                  "AI-generated technical questions",
                  "Real-time video interview room",
                  "Automated evaluation reports",
                  "Task assignment & tracking",
                  "PDF report generation",
                  "Candidate email notifications",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={11} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developer */}
            <div className="border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Target size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Developers</p>
                  <p className="text-[10px] text-green-600 font-semibold">✓ Available Now</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Magic link login — no account needed",
                  "Simple interview join dashboard",
                  "Monaco editor for live coding",
                  "Real-time Q&A with countdown timer",
                  "LeetCode-style coding problems",
                  "Take-home task ZIP submission",
                  "AI code quality & plagiarism check",
                  "Evaluation report via email",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={11} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intern — Coming Soon */}
            <div className="border-2 border-dashed border-amber-200 rounded-2xl p-6 bg-amber-50/30 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Brain size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight pr-2">Interns & Job Seekers</p>
                    <p className="text-[10px] text-amber-600 font-semibold leading-tight">🔜 Coming Soon</p>
                  </div>
                </div>
                
                <span className="flex shrink-0 items-center gap-1 bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  <Clock size={8} /> Coming Soon
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                A free self-learning module for freshers and interns to build real interview
                skills through practice — not just theory.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Industry-standard take-home tasks",
                  "Submit work and get AI feedback",
                  "Learn what to improve and how",
                  "Real HR interview Q&A bank",
                  "AI evaluates your written answers",
                  "Spelling & grammar corrections",
                  "LeetCode-style coding practice",
                  "Track your skill progress over time",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 opacity-80">
                    <Clock size={11} className="text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  🎯 Goal: Help interns land their first job through real practice, AI feedback, and industry-level challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15",   label: "AI Questions Per Interview" },
              { value: "10s",  label: "Answer Evaluation Speed"    },
              { value: "100%", label: "Automated Scoring"          },
              { value: "35+",  label: "Default Task Templates"     },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-white mb-1">{value}</p>
                <p className="text-xs text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">Built With</p>
          <h2 className="text-xl font-bold text-gray-900 mb-8">Production-grade technology stack</h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "React + TypeScript","Node.js + Express","PostgreSQL + Prisma",
              "Redis","Socket.io","PeerJS (WebRTC)","Groq AI (Llama 3.3-70B)",
              "Stripe","NodeMailer","Cloudinary","Judge0 API",
              "MediaPipe","Monaco Editor","@react-pdf/renderer",
            ].map(tech => (
              <span key={tech} className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to modernize your hiring?</h2>
          <p className="text-sm text-gray-500 mb-8">
            Join companies using SkillForge AI to run smarter, faster technical interviews.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Get Started Free
            </button>
            <button onClick={() => navigate("/contact")} className="px-6 py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} SkillForge AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/privacy")} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/contact")} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  )
}