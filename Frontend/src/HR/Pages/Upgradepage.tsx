import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, Crown, Zap, Users, FileText, Brain,
  ArrowLeft, Loader2, Sparkles, Star, Calendar,
  Code2
} from "lucide-react";
import { api } from "../../Api/Axios";

// ─── What's actually built in SkillForge AI ───────────────

const features = [
  {
    category: "Interviews",
    items: [
      { label: "Monthly Interviews",      free: "5 interviews",   pro: "Unlimited"       },
      { label: "Interview Scheduling",    free: true,             pro: true              },
      { label: "Reschedule Interview",    free: true,             pro: true              },
      { label: "Magic Link Invitations",  free: true,             pro: true              },
    ],
  },
  {
    category: "Resume & AI",
    items: [
      { label: "Resume Upload (PDF)",     free: false,            pro: true              },
      { label: "AI Resume Parsing",       free: false,            pro: true              },
      { label: "AI Candidate Summary",    free: false,            pro: true              },
      { label: "Skills Auto Extraction",  free: false,            pro: true              },
    ],
  },
  {
    category: "Task Management",
    items: [
      { label: "Default Task Library",    free: "5 tasks",        pro: "All 35 tasks"    },
      { label: "Custom Task Creation",    free: false,            pro: true              },
      { label: "Assign Take-Home Tasks",  free: false,            pro: true              },
      { label: "Task Deadline System",    free: false,            pro: true              },
    ],
  },
  {
    category: "Developer Profiles",
    items: [
      { label: "Developer List View",     free: true,             pro: true              },
      { label: "Full Developer Profile",  free: false,            pro: true              },
      { label: "Resume Viewer",           free: false,            pro: true              },
      { label: "Interview History",       free: false,            pro: true              },
    ],
  },
];

const proHighlights = [
  {
    icon: <Zap size={16} />,
    title: "Unlimited Interviews",
    desc: "Schedule as many interviews as you need. No monthly cap.",
  },
  {
    icon: <Brain size={16} />,
    title: "AI Resume Parsing",
    desc: "Upload a PDF and AI extracts name, email, skills, and experience instantly.",
  },
  {
    icon: <FileText size={16} />,
    title: "AI Candidate Summary",
    desc: "Get a professional recruiter-style summary for every candidate automatically.",
  },
  {
    icon: <Code2 size={16} />,
    title: "Full Task Library",
    desc: "Access all 35 real-world coding tasks across Frontend, Backend, DevOps and more.",
  },
  {
    icon: <Calendar size={16} />,
    title: "Take-Home Task System",
    desc: "Assign tasks with deadlines. Auto-expires when time is up. Developer cannot resubmit.",
  },
  {
    icon: <Users size={16} />,
    title: "Full Developer Profiles",
    desc: "View resume, AI summary, skills, and complete interview history per candidate.",
  },
];

// ─── Cell renderer ────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={15} className="text-emerald-500 mx-auto" />;
  if (value === false)
    return <X size={15} className="text-gray-300 mx-auto" />;
  return (
    <span className="text-xs text-gray-600 font-medium">{value}</span>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function UpgradePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post("/subscription/checkout");
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      
    
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={13} />
              Back
            </button>

      <div className="max-w-5xl mx-auto px-6  space-y-16">

        {/* ── Hero ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <Crown size={11} /> Pro Plan
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Hire smarter.{" "}
            <span className="text-blue-600">No limits.</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Unlock AI resume parsing, unlimited interviews, full task
            library, and complete developer profiles — everything your
            hiring team needs in one platform.
          </p>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">

          {/* Free */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Free
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-gray-900">$0</span>
                <span className="text-xs text-gray-400 mb-1.5">/ month</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get started with basic hiring
              </p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {[
                "5 interviews per month",
                "Interview scheduling",
                "Magic link invitations",
                "Reschedule support",
                "5 default tasks",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <Check size={12} className="text-gray-400 shrink-0" />
                  {f}
                </li>
              ))}
              {[
                "AI resume parsing",
                "Custom task creation",
                "Full developer profiles",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-gray-300 line-through"
                >
                  <X size={12} className="text-gray-200 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="w-full text-center py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-400 bg-gray-50">
              Current Plan
            </div>
          </div>

          {/* Pro */}
          <div className="relative bg-gray-900 rounded-2xl p-6 shadow-xl shadow-gray-900/20 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Popular badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
              <Star size={8} fill="currentColor" /> Popular
            </div>

            <div className="mb-5 relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                Pro
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">$49</span>
                <span className="text-xs text-gray-400 mb-1.5">/ month</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Full access to everything
              </p>
            </div>

            <ul className="space-y-2.5 mb-6 relative">
              {[
                "Unlimited interviews",
                "AI resume parsing",
                "AI candidate summaries",
                "All 35 task templates",
                "Custom task creation",
                "Take-home task system",
                "Full developer profiles",
                "Resume viewer",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-gray-200"
                >
                  <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Check size={9} className="text-blue-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="relative w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <Crown size={13} />
                  Upgrade to Pro — $49/mo
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Pro Highlights Grid ── */}
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight text-center mb-6">
            Everything included in Pro
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {proHighlights.map((h) => (
              <div
                key={h.title}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                  {h.icon}
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1">
                  {h.title}
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight text-center mb-6">
            Free vs Pro — Full comparison
          </h2>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50/80 border-b border-gray-100 px-6 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Feature
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                Free
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 text-center">
                Pro
              </div>
            </div>

            {features.map((group, gi) => (
              <div key={group.category}>
                <div className="px-6 py-2.5 bg-gray-50/40 border-b border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {group.category}
                  </p>
                </div>

                {group.items.map((item, ii) => (
                  <div
                    key={item.label}
                    className={`grid grid-cols-3 px-6 py-3.5 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors
                      ${
                        gi === features.length - 1 &&
                        ii === group.items.length - 1
                          ? "border-b-0"
                          : ""
                      }`}
                  >
                    <span className="text-xs text-gray-700 font-medium">
                      {item.label}
                    </span>
                    <div className="text-center">
                      <Cell value={item.free} />
                    </div>
                    <div className="text-center">
                      <Cell value={item.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="bg-gray-900 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Crown size={11} /> Start today
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Ready to scale your hiring?
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Upgrade to Pro and get unlimited interviews, AI resume
              parsing, and the full task library — all in one place.
            </p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-xl shadow-blue-500/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <Crown size={15} />
                  Upgrade to Pro — $49/mo
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-500 mt-3">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
