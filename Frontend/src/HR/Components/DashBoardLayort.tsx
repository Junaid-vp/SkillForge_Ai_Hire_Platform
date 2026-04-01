import { useState } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Sparkles, LayoutDashboard, PlusCircle, Code2, BookOpen, CalendarDays, BarChart2, Settings, ChevronLeft, AlignJustify, LogOut, Crown } from 'lucide-react'
import { api } from '../../Api/Axios'

const navItems = [
  { label: 'Dashboard',          path: '/dashboard',                  group: 'Main',   icon: <LayoutDashboard size={15} /> },
  { label: 'Create Interview',   path: '/dashboard/create-interview', group: 'Main',   icon: <PlusCircle size={15} /> },
  { label: 'Developers',         path: '/dashboard/developers',       group: 'Hiring', icon: <Code2 size={15} /> },
  { label: 'Task Library',       path: '/dashboard/task-library',     group: 'Hiring', icon: <BookOpen size={15} /> },
  { label: 'Interview Schedule', path: '/dashboard/schedule',         group: 'Hiring', icon: <CalendarDays size={15} /> },
  { label: 'Reports',            path: '/dashboard/reports',          group: 'System', icon: <BarChart2 size={15} /> },
  { label: 'Settings',           path: '/dashboard/settings',         group: 'System', icon: <Settings size={15} /> },
]

const groups = ['Main', 'Hiring', 'System']

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const activeLabel =
    navItems.find(n => n.path === location.pathname)?.label ??
    (location.pathname === '/dashboard/upgrade' ? 'Upgrade' : 'Dashboard')

  const handleLogout = async () => {
    try {
      await api.post('/auth/hr/logout')
    } catch (e) {
      console.log(e)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased">

      {/* ── Sidebar ── */}
      <aside className={`${collapsed ? 'w-[60px]' : 'w-56'} min-w-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 min-h-16 border-b border-gray-100">
          <div className="w-7 h-7 min-w-[28px] bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className={`font-bold text-sm tracking-tight text-gray-900 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            SkillForge AI
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-none">
          {groups.map(group => {
            const items = navItems.filter(n => n.group === group)
            return (
              <div key={group} className="px-3 mb-5">
                {!collapsed && (
                  <p className="text-[9px] font-medium tracking-[0.18em] uppercase text-gray-400 px-2 mb-1.5">
                    {group}
                  </p>
                )}
                {items.map(item => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 mb-0.5
                        ${isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-r" />
                      )}
                      <span className="min-w-[15px] flex items-center justify-center">{item.icon}</span>
                      <span className={`transition-all duration-200 overflow-hidden ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>



        {/* Sidebar bottom — Logout + Collapse */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2 py-2 w-full text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
          >
            <span className="min-w-[15px] flex items-center justify-center">
              <LogOut size={14} />
            </span>
            <span className={`text-[10px] font-medium tracking-[0.12em] uppercase whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>

          {/* Collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2.5 px-2 py-2 w-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150"
          >
            <span className={`min-w-[15px] flex items-center justify-center transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronLeft size={14} />
            </span>
            <span className={`text-[10px] font-medium tracking-[0.12em] uppercase whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Collapse
            </span>
          </button>

        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-8 border-b border-gray-100 bg-white/80 backdrop-blur-md min-h-16 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-gray-700 transition-colors lg:hidden"
            >
              <AlignJustify size={18} />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">{activeLabel}</h1>
          </div>

          {/* Right Side: Upgrade + Avatar */}
          <div className="flex items-center gap-4">
            {location.pathname !== "/dashboard/upgrade" && (
              <button onClick={() => navigate("/dashboard/settings")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-indigo-200/50">
                <Crown size={14} className="text-indigo-100" />
                Upgrade to Pro
              </button>
            )}

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[11px] font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-sm"
              >
                HR
              </button>

            {showDropdown && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

                {/* Dropdown */}
                <div className="absolute right-0 top-11 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 overflow-hidden">
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/dashboard/settings'); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={13} />
                    Settings
                  </button>
                  <div className="h-px bg-gray-100" />
                  <button
                    onClick={() => { setShowDropdown(false); handleLogout(); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
