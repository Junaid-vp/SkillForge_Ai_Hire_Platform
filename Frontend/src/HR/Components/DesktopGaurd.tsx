import { useEffect, useState } from "react"
import { Monitor, Ruler, Smartphone } from "lucide-react"
import { Logo } from "./Icons"

const MobileGuard = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!isMobile) return <>{children}</>

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans antialiased overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <Logo className="justify-center mb-6" />

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 px-6 py-8 text-center">

          {/* Icon */}
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Monitor size={26} className="text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 tracking-tight mb-2">Desktop Required</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            SkillForge AI is designed for desktop and laptop browsers. Please open this on a larger screen.
          </p>

          {/* Info rows */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 text-left mb-6">
            {[
              { icon: <Monitor size={13} className="text-blue-500" />,    text: "Open on a laptop or desktop"  },
              { icon: <Ruler size={13} className="text-blue-500" />,      text: "Minimum screen width: 1024px" },
              { icon: <Smartphone size={13} className="text-blue-500" />, text: "Mobile support coming soon"   },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <p className="text-xs text-gray-600 font-medium">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400">© 2026 SkillForge AI. All rights reserved.</p>
        </div>

      </div>
    </div>
  )
}

export default MobileGuard