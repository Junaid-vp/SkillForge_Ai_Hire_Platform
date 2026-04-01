import { User, Mail, Briefcase, Clock, CalendarDays, Code2 } from "lucide-react";
import { SectionCard, InfoRow } from "./SectionCard";
import { formatDate, formatTime, parseSkills, type Developer } from "../Types/developer.types";


export function DeveloperDetailsSection({ dev }: { dev: Developer }) {
  const skills = parseSkills(dev.skills);

  return (
    <SectionCard
      icon={<User size={13} className="text-blue-600" />}
      title="Developer Details"
      subtitle="Candidate profile and contact information"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
        <InfoRow icon={<User size={13} className="text-gray-400" />}         label="Full Name"       value={dev.developerName} />
        <InfoRow icon={<Mail size={13} className="text-gray-400" />}         label="Email"           value={dev.developerEmail} />
        <InfoRow icon={<Briefcase size={13} className="text-gray-400" />}    label="Position"        value={dev.position} />
        <InfoRow icon={<Clock size={13} className="text-gray-400" />}        label="Experience"      value={`${dev.experience} year${dev.experience !== 1 ? "s" : ""}`} />
        <InfoRow icon={<CalendarDays size={13} className="text-gray-400" />} label="Interview Date"  value={formatDate(dev.interviewDate)} />
        <InfoRow icon={<Clock size={13} className="text-gray-400" />}        label="Interview Time"  value={formatTime(dev.interviewTime)} />
      </div>

      {skills.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
            <Code2 size={11} /> Technical Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[11px] font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}