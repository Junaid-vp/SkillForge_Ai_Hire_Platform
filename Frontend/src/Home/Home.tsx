import { Sparkles, Code, BarChart, Target, Users, Layout, Cpu, MessageSquare, Zap, FileText, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const howItWorks = [
  { icon: <Target className="w-4 h-4 text-blue-600" />, title: 'Select a Coding Task', desc: 'HR teams choose from a library of pre-built real-world coding challenges.' },
  { icon: <Code className="w-4 h-4 text-blue-600" />, title: 'Candidates Submit Code', desc: 'Developers complete the task in VS Code and upload their project files.' },
  { icon: <Cpu className="w-4 h-4 text-blue-600" />, title: 'AI Analysis & Report', desc: 'AI analyzes code for quality, security, and performance.' },
  { icon: <Users className="w-4 h-4 text-blue-600" />, title: 'Job Seeker Practice', desc: 'Practice challenges, get AI feedback, and improve for interviews.' },
]

const hrFeatures = [
  { icon: <Layout className="w-4 h-4 text-gray-700" />, title: 'Structured Interview Platform', desc: 'Invite candidates to complete real-world coding tasks and review submissions.' },
  { icon: <BarChart className="w-4 h-4 text-gray-700" />, title: 'AI-Powered Insights', desc: 'Detailed evaluation reports with AI analysis of code quality and performance.' },
  { icon: <Users className="w-4 h-4 text-gray-700" />, title: 'Candidate Dashboard', desc: 'Manage all candidates, submissions, and evaluations in one place.' },
]

const devFeatures = [
  { icon: <Code className="w-4 h-4 text-gray-700" />, title: 'Practice Coding Challenges', desc: 'Solve technical interview questions and improve your problem-solving skills.' },
  { icon: <MessageSquare className="w-4 h-4 text-gray-700" />, title: 'Answer HR Interview Questions', desc: 'Practice common HR questions and submit answers through the platform.' },
  { icon: <Zap className="w-4 h-4 text-gray-700" />, title: 'AI Feedback on Answers', desc: 'Receive AI-powered feedback and improvement suggestions on your solutions.' },
  { icon: <FileText className="w-4 h-4 text-gray-700" />, title: 'AI Resume Review', desc: 'Get AI feedback to improve your resume formatting, clarity, and presentation.' },
]

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For HR', href: '#for-hr' },
  { label: 'For Developers', href: '#for-devs' },
]

function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">SkillForge <span className="text-blue-600">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="hover:text-gray-900 transition-colors">{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/rollselection')}
            >
              Get Started <ArrowRight size={13} />
            </button>
            <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 text-sm font-medium text-gray-600">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="block hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <button
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/rollselection')}
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow">

        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/60 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-6 py-24 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">AI-Powered Career Intelligence</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight max-w-xl">
                  Verify Real Technical Skills with{' '}
                  <span className="text-blue-600">AI Code Analysis</span>
                </h1>

                <p className="text-base text-gray-500 leading-relaxed max-w-md">
                  SkillForge AI helps HR teams make confident hiring decisions by analyzing real code submissions — while helping job seekers showcase and improve their skills.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/rollselection')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Get Started <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full">
                <img
                  src="/Home/3c421513-15f3-4ce0-ba0e-730e6d64097e.png"
                  alt="SkillForge Platform"
                  className="w-full rounded-2xl shadow-xl border border-gray-100 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gray-50/80 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em]">Simple Process</span>
              <h2 className="text-3xl font-bold mt-3 tracking-tight">How SkillForge AI Works</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {howItWorks.map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md hover:shadow-blue-50 transition-all group">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">{card.icon}</div>
                  <p className="text-xs font-bold text-blue-600 mb-1.5">0{i + 1}</p>
                  <h4 className="text-sm font-semibold mb-1.5 text-gray-900">{card.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For HR */}
        <section id="for-hr" className="container mx-auto px-6 py-20 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full order-2 lg:order-1">
              <img src="/Home/b7a74eab-320f-4710-a25d-89309bcd6719.png" alt="HR Dashboard" className="w-full rounded-2xl shadow-xl border border-gray-100" />
            </div>
            <div className="flex-1 space-y-7 order-1 lg:order-2">
              <div>
                <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em]">For Employers</span>
                <h2 className="text-3xl font-bold mt-3 mb-3 tracking-tight">For HR Team</h2>
                <div className="w-12 h-0.5 bg-blue-200" />
              </div>
              <div className="space-y-5">
                {hrFeatures.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1 text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* For Job Seekers */}
        <section id="for-devs" className="bg-gray-50/80 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-7">
                <div>
                  <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em]">For Developers</span>
                  <h2 className="text-3xl font-bold mt-3 mb-3 tracking-tight">For Job Seekers</h2>
                  <div className="w-12 h-0.5 bg-blue-200" />
                </div>
                <div className="space-y-5">
                  {devFeatures.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-9 h-9 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{item.icon}</div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1 text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <img src="/Home/f9b871de-701f-4ee0-823d-ad048100e29c.png" alt="Job Seeker Dashboard" className="w-full rounded-2xl shadow-xl border border-gray-100 object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gray-900 py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="relative container mx-auto px-6 max-w-3xl text-center space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Evaluate Real Coding Skills with AI</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">Join leading companies using SkillForge AI to make smarter hiring decisions.</p>
            <button
              onClick={() => navigate('/rollselection')}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight">SkillForge <span className="text-blue-600">AI</span></span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Career Intelligence Platform for modern recruitment.</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-900">Product</p>
              {['How It Works', 'For HR Teams', 'For Developers'].map(l => (
                <a key={l} href="#" className="block text-sm text-gray-500 hover:text-blue-600 transition-colors">{l}</a>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-900">Company</p>
              {['About', 'Contact', 'Privacy Policy'].map(l => (
                <a key={l} href="#" className="block text-sm text-gray-500 hover:text-blue-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>

          <div className="py-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-400">© 2026 SkillForge AI. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;