import { useEffect, useState } from 'react';
import { Bell, CalendarClock, FileCode2, Activity, Loader2 } from 'lucide-react';
import { api } from '../../Api/Axios';
import toast from 'react-hot-toast';

function Notification() {
  const [loading, setLoading] = useState(true);
  const [toggles, setToggles] = useState({
    interviews: true,
    submissions: true,
    progress: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/setting/hrSpecificDetails');
      const hr = res.data.Hr;
      setToggles({
        interviews: hr.notifInterviews,
        submissions: hr.notifSubmissions,
        progress: hr.notifProgress,
      });
    } catch (error) {
      console.error('Failed to fetch notification settings', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof typeof toggles) => {
    const newToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(newToggles);

    try {
      await api.patch('/setting/notifications', {
        notifInterviews: newToggles.interviews,
        notifSubmissions: newToggles.submissions,
        notifProgress: newToggles.progress,
      });
      toast.success('Preferences updated', { id: 'notif-save' });
    } catch (error) {
      // Revert on error
      setToggles(toggles);
      toast.error('Failed to save changes');
    }
  };

  const notifications = [
    {
      id: 'interviews',
      icon: <CalendarClock size={16} className="text-gray-400" />,
      title: 'Interview Reminders',
      desc: 'Get reminded before scheduled interviews',
    },
    {
      id: 'submissions',
      icon: <FileCode2 size={16} className="text-gray-400" />,
      title: 'Task Submissions',
      desc: 'Notify when developers submit tasks',
    },
    {
      id: 'progress',
      icon: <Activity size={16} className="text-gray-400" />,
      title: 'Task Progress',
      desc: 'Notify when developers tasks progress is Ready',
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Bell size={13} className="text-indigo-500" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-gray-800">Notification Settings</h2>
          <p className="text-[11px] text-gray-400">Manage how you receive alerts and updates</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
          </div>
        )}
        <div className="space-y-4">
          {notifications.map((item) => {
            const isChecked = toggles[item.id as keyof typeof toggles];

            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => handleToggle(item.id as keyof typeof toggles)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50 border border-gray-100 group-hover:bg-white'}`}>
                    <div className={`transition-colors ${isChecked ? 'text-indigo-600' : 'text-gray-400/80 group-hover:text-gray-500'}`}>
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isChecked ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {isChecked ? 'On' : 'Off'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isChecked}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transition-colors duration-200 ease-in-out border-2 border-transparent ${isChecked ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className="sr-only">Use setting</span>
                    <span 
                      aria-hidden="true" 
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} 
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Notification;