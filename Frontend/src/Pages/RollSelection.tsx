import { Briefcase, Code, User, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../HR/Components/Icons';

const roles = [
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Employers / HR',
    desc: 'Create interviews, assign tasks, and evaluate candidates automatically with AI insights.',
    path: '/signup',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-200',
    hoverShadow: 'hover:shadow-blue-50',
    btnLabel: "I'm an Employer",
  },
  {
    icon: <Code className="w-5 h-5" />,
    label: 'Developers',
    desc: 'Access practice arenas, track progress, participate in code evaluations and connect with Github.',
    path: "/devLogin",
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    hoverBorder: 'hover:border-indigo-200',
    hoverShadow: 'hover:shadow-indigo-50',
    btnLabel: "I'm a Developer",
  },
  {
    icon: <User className="w-5 h-5" />,
    label: 'Job Seekers',
    desc: 'Prepare for interviews, get personalized AI feedback on answers, and perfect your resume.',
    path: '#',
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    hoverBorder: 'border-gray-100',
    hoverShadow: '',
    btnLabel: "Coming Soon",
    locked: true,
  },
]

function RollSelection() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 max-w-7xl flex items-center justify-between">
          <Logo onClick={() => navigate('/')} className="cursor-pointer" />

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-grow relative flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/60 rounded-full blur-3xl" />

        <div className="relative w-full max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Get Started</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
              Who are you?
            </h1>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Select your role to continue to the platform.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div
                key={role.label}
                onClick={() => !role.locked && navigate(role.path)}
                className={`bg-white rounded-xl border border-gray-100 ${role.hoverBorder} ${role.hoverShadow} transition-all flex flex-col ${role.locked ? 'opacity-70 cursor-not-allowed filter grayscale-[0.3]' : 'hover:shadow-lg cursor-pointer group'}`}
              >
                <div className="p-7 flex-1 relative">
                  {role.locked && (
                    <span className="absolute top-6 right-6 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gray-200">
                      Coming Soon
                    </span>
                  )}
                  <div className={`w-10 h-10 ${role.bg} rounded-lg flex items-center justify-center mb-5 ${role.color} ${role.locked ? '' : 'group-hover:scale-110'} transition-transform`}>
                    {role.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-gray-900">{role.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{role.desc}</p>
                </div>

                <div className="px-7 pb-7">
                  <div className={`flex items-center justify-between text-sm font-semibold border-t border-gray-100 pt-5 transition-colors ${role.locked ? 'text-gray-400' : 'text-gray-400 group-hover:text-blue-600'}`}>
                    <span>{role.btnLabel}</span>
                    {role.locked ? (
                      <Lock size={15} className="text-gray-400" />
                    ) : (
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-4">
        <p className="text-center text-xs text-gray-400">© 2026 SkillForge AI. All rights reserved.</p>
      </div>

    </div>
  )
}

export default RollSelection;