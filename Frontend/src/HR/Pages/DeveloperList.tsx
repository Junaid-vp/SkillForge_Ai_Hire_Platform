
import { useState, useEffect } from "react";
import { Search, Users, Calendar, Clock, Briefcase, ChevronRight, Inbox } from 'lucide-react';
import { api } from "../../Api/Axios";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";

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

const fetchDevDatas = async (search: string) => {
  const url = search ? `/interview/developers?search=${encodeURIComponent(search)}` : "/interview/developers";
  const res = await api.get(url);
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: devList, isLoading, error } = useQuery<DevDetails[]>({
    queryKey: ['Developers', debouncedSearch],
    queryFn: () => fetchDevDatas(debouncedSearch),
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Developers</h1>
            <p className="text-sm text-gray-400 mt-1">Manage invited developers and view their progress</p>
          </div>
          
          <div className="flex items-center gap-3 flex-1 max-w-md">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text"
                  placeholder="Search developers by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
             </div>
             {devList && (
               <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl shrink-0">
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                   {devList.length} Found
                 </span>
               </div>
             )}
          </div>
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
      {!isLoading && !error && devList && devList.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            {searchTerm ? <Search size={32} /> : <Users size={32} />}
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {searchTerm ? "No developers found" : "No developers invited yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm ? `No results match "${searchTerm}"` : "Create an interview to get started"}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
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
                    onClick={() => navigate(`/dashboard/devFullDetails/${dev.id}`)}
                    className="group inline-flex w-[172px] items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200"
                  >
                    <span className="whitespace-nowrap">View Details</span>
                    <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
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
