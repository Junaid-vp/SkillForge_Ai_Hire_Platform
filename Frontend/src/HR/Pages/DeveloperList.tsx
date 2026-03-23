
import { api } from "../../Api/Axios";
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, Clock, Briefcase, ChevronRight } from 'lucide-react';

interface DevDetails {
  id: string;
  createdAt: Date;
  developerEmail: string;
  developerName: string;
  experience: number;
  interviewDate: Date;
  interviewTime: string;
  position: string;
  uniqueCode: string;
  hrId: string;
}

const fetchDevDatas = async () => {
  const res = await api.get("/interview/developers");
  return res.data.data;
};

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (t: string) => {
  if (!t?.includes(':')) return t;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

function DeveloperList() {
  const { data: devList, isLoading, error } = useQuery<DevDetails[]>({
    queryKey: ['Developers'],
    queryFn: fetchDevDatas,
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Users size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">HR Portal</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Developers</h1>
            <p className="text-sm text-gray-400 mt-1">Manage invited developers and view their progress</p>
          </div>
          {devList && devList.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-blue-600">{devList.length} Invited</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-red-500">Failed to load developers</p>
          <p className="text-xs text-gray-400 mt-1">Please try again later</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && devList?.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No developers invited yet</p>
          <p className="text-xs text-gray-400 mt-1">Create an interview to get started</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && devList && devList.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
            <p className="col-span-3 text-[10px] font-600 uppercase tracking-[0.12em] text-gray-400">Developer</p>
            <p className="col-span-3 text-[10px] font-600 uppercase tracking-[0.12em] text-gray-400">Position</p>
            <p className="col-span-2 text-[10px] font-600 uppercase tracking-[0.12em] text-gray-400">Schedule</p>
            <p className="col-span-2 text-[10px] font-600 uppercase tracking-[0.12em] text-gray-400">Experience</p>
            <p className="col-span-2 text-[10px] font-600 uppercase tracking-[0.12em] text-gray-400 text-right">Action</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {devList.map((dev) => (
              <div key={dev.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">

                {/* Developer */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{dev.developerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{dev.developerName}</p>
                    <p className="text-xs text-gray-400 truncate">{dev.developerEmail}</p>
                  </div>
                </div>

                {/* Position */}
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                    <Briefcase size={11} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 truncate">{dev.position}</span>
                  </span>
                </div>

                {/* Schedule */}
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-blue-400 shrink-0" />
                    <span className="text-xs text-gray-600">{formatDate(dev.interviewDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-blue-400 shrink-0" />
                    <span className="text-xs text-gray-600">{formatTime(dev.interviewTime)}</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-gray-700">
                    {dev.experience} {dev.experience === 1 ? 'year' : 'years'}
                  </span>
                  <p className="text-[10px] text-gray-400">experience</p>
                </div>

                {/* Action */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => {/* you will handle this */}}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
                  >
                    View Progress
                    <ChevronRight size={13} />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default DeveloperList;