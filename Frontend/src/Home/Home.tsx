import { Sparkles, Code, BarChart, Target, Users, Layout, Cpu, MessageSquare, Zap, FileText, ArrowRight, Menu, X, Brain, Shield, Video, Twitter, Github, Linkedin, ChevronDown } from 'lucide-react';
import { Logo, Bolt } from '../HR/Components/Icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const howItWorks = [
  {
    icon:  <Users   className="w-4 h-4 text-blue-600" />,
    title: 'Schedule Interview',
    desc:  'HR uploads developer resume. AI parses it and auto-fills candidate details instantly.',
  },
  {
    icon:  <Video   className="w-4 h-4 text-blue-600" />,
    title: 'Live Interview Room',
    desc:  'Video call with screen sharing, live Q&A panel, and real-time AI malpractice detection.',
  },
  {
    icon:  <Brain   className="w-4 h-4 text-blue-600" />,
    title: 'AI Evaluates Answers',
    desc:  'Each answer is scored 0–10 by AI with feedback, strengths, and missing points.',
  },
  {
    icon:  <FileText className="w-4 h-4 text-blue-600" />,
    title: 'Report & Decision',
    desc:  'Get a full PDF report with scores, HR notes, and AI recommendation to hire or reject.',
  },
];

const hrFeatures = [
  {
    icon:  <Layout className="w-4 h-4 text-gray-700" />,
    title: 'AI-Powered Interview Room',
    desc:  'Live video call with Q&A panel, screen sharing, Monaco code editor, and malpractice detection.',
  },
  {
    icon:  <Brain  className="w-4 h-4 text-gray-700" />,
    title: 'Automatic Question Generation',
    desc:  'AI generates 15 technical questions based on developer resume, skills, and job position.',
  },
  {
    icon:  <BarChart className="w-4 h-4 text-gray-700" />,
    title: 'Evaluation Reports',
    desc:  'Full PDF report with Q&A scores, LeetCode results, task evaluation, and hire/reject recommendation.',
  },
  {
    icon:  <Shield className="w-4 h-4 text-gray-700" />,
    title: 'AI Malpractice Detection',
    desc:  'Detects phone use, multiple faces, head movement, and tab switching in real-time during interviews.',
  },
];



const internFeatures = [
  {
    icon:  <Target className="w-4 h-4 text-gray-700" />,
    title: 'AI Evaluates Skills',
    desc:  'A free self-learning module for freshers and interns to build real interview skills through practice.',
  },
  {
    icon:  <MessageSquare className="w-4 h-4 text-gray-700" />,
    title: 'Real HR Questions & AI Feedback',
    desc:  'Access a bank of real HR interview questions. AI evaluates your written answers and provides corrections.',
  },
  {
    icon:  <Code className="w-4 h-4 text-gray-700" />,
    title: 'Industry LeetCode Questions',
    desc:  'Practice tackling industry-standard logical LeetCode problems and take-home tasks.',
  },
  {
    icon:  <BarChart className="w-4 h-4 text-gray-700" />,
    title: 'Identify Areas of Improvement',
    desc:  'AI continuously tracks your progress and explicitly highlights which specific fields you need to improve to land a job.',
  },
];


const devFeatures = [
  {
    icon:  <Code        className="w-4 h-4 text-gray-700" />,
    title: 'Magic Link Access',
    desc:  'No registration needed. Click the link in your email to join the interview instantly.',
  },
  {
    icon:  <MessageSquare className="w-4 h-4 text-gray-700" />,
    title: 'Live Q&A Session',
    desc:  'Answer technical questions one by one with a timer. AI evaluates each answer live.',
  },
  {
    icon:  <Zap        className="w-4 h-4 text-gray-700" />,
    title: 'In-Browser Code Editor',
    desc:  'Solve LeetCode-style problems in a Monaco editor with real-time code execution.',
  },
  {
    icon:  <Target     className="w-4 h-4 text-gray-700" />,
    title: 'Take-Home Task',
    desc:  'Complete a real-world coding task and submit via  ZIP. AI reviews your code.',
  },
];


const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For HR', href: '#for-hr' },
  { label: 'For Developers', href: '#for-devs' },
  { label: 'For Job Seekers', href: '#for-interns' },
]

function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 max-w-7xl flex items-center justify-between">
          <Logo onClick={() => navigate('/')} className="cursor-pointer" />

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            {/* Product Dropdown */}
            <div className="relative group py-1">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer outline-none">
                Product <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="w-40 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-xl overflow-hidden flex flex-col p-1.5 backdrop-blur-md">
                  {navLinks.filter(l => l.href !== '#how-it-works').map(l => (
                    <a key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="#how-it-works" className="relative hover:text-blue-600 transition-colors group py-1">
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            
            {/* Company Dropdown */}
            <div className="relative group py-1">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer outline-none">
                Company <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="w-36 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-xl overflow-hidden flex flex-col p-1.5 backdrop-blur-md">
                  <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors">About</Link>
                  <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors">Contact</Link>
                  <Link to="/privacy" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors">Privacy</Link>
                </div>
              </div>
            </div>
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
                  <Bolt className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">AI-Powered Career Intelligence</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight max-w-xl">
                  Verify Real Technical Skills with{' '}
                  <span className="text-blue-600">AI Code Analysis</span>
                </h1>

                <p className="text-base text-gray-500 leading-relaxed max-w-md">
                 
                  SkillForge AI gives HR teams a complete interview platform — live video,
                  AI-generated questions, instant evaluation, malpractice detection,
                  and automated reports. All in one place.
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
              <img src="/Home/ChatGPT Image Apr 19, 2026, 11_10_19 PM.png" alt="HR Dashboard" className="w-full rounded-2xl shadow-xl border border-gray-100" />
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

        {/* For Developers */}
        <section id="for-devs" className="bg-gray-50/80 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-7">
                <div>
                  <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em]">For Candidates</span>
                  <h2 className="text-3xl font-bold mt-3 mb-3 tracking-tight">For Developers</h2>
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
                <img src="/Home/ChatGPT Image Apr 19, 2026, 10_58_55 PM.png" alt="Job Seeker Dashboard" className="w-full rounded-2xl shadow-xl border border-gray-100 object-cover" />
              </div>
            </div>
          </div>
        </section>
                {/* For Intern JobSeekers */}
        <section id="for-interns" className="container mx-auto px-6 py-20 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full order-2 lg:order-1">
              <img src="/Home/ChatGPT Image Apr 19, 2026, 11_26_26 PM.png" alt="HR Dashboard" className="w-full rounded-2xl shadow-xl border border-gray-100" />
            </div>
            <div className="flex-1 space-y-7 order-1 lg:order-2">
              <div>
                <span className="text-blue-600 font-semibold text-xs uppercase tracking-[0.2em]">For Interns</span>
                <h2 className="text-3xl font-bold mt-3 mb-3 tracking-tight">For JobSeekers</h2>
                <div className="w-12 h-0.5 bg-blue-200" />
              </div>
              <div className="space-y-5">
                {internFeatures.map((item, i) => (
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
          <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-4 md:col-span-2">
              <Logo />
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                The career intelligence platform for modern recruitment. We help HR teams assess developers accurately and empower engineers to land their dream jobs.
              </p>
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold tracking-wide text-gray-900">Platform</p>
              <div className="flex flex-col space-y-3">
                {navLinks.map(l => (
                  <a key={l.label} href={l.href} className="w-fit text-sm text-gray-500 hover:text-blue-600 transition-colors">{l.label}</a>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold tracking-wide text-gray-900">Company</p>
              <div className="flex flex-col space-y-3">
                {[{to:'About',path:"/about"}, {to:'Contact', path:"/contact"}, {to:'Privacy Policy',path:"/privacy"}].map(l => (
                  <Link key={l.to} to={l.path} className="w-fit text-sm text-gray-500 hover:text-blue-600 transition-colors">{l.to}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} SkillForge AI. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-600 font-medium">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;