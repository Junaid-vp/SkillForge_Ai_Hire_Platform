// src/Dev/Components/ThankYouScreen.tsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "../../Api/Axios"

export default function ThankYouScreen() {
const navigate = useNavigate();
const [count, setCount] = useState(10);

useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);

useEffect(() => {
  if (count === 0) {
    const logout = async () => {
      try {
        await api.post("/dev/logout");
        toast.success("Logged out successfully.");
        navigate("/devLogin");
      } catch (err) {
        console.error(err);
      }
    };

    logout();
  }
}, [count, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans antialiased">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center max-w-sm w-full mx-4">

        {/* Success icon with pulse */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50" />
          <div className="relative w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </div>
          <span className="text-xs font-bold text-gray-400 tracking-tight">SkillForge AI</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Thank You for Submitting!
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Your task has been submitted successfully. We will review your
          submission and inform you about the next steps via email.
        </p>

        {/* Countdown */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">This page will close in</p>
          <div className="text-3xl font-black text-blue-600">{count}</div>
          <p className="text-xs text-gray-400 mt-1">seconds</p>
        </div>

        <p className="text-[10px] text-gray-300 mt-4">
          You will be redirected to the login page
        </p>
      </div>
    </div>
  )
}