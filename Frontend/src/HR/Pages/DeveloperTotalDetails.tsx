import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Logo } from "../Components/Icons";
import { api } from "../../Api/Axios";
import { DeveloperDetailsSection } from "../Components/DeveloperDetailsSection";
import { AISummarySection } from "../Components/AISummarySection";
import { TaskSection } from "../Components/TaskSection";
import { ResumeSection } from "../Components/ResumeSection";
import type { DevDetailsResponse } from "../Types/developer.types";
import { InterviewSection } from "../Components/InterviewSection";


const fetchDeveloperDetails = async (id: string): Promise<DevDetailsResponse> => {
  const res = await api.get(`/resume/totalDetails/${id}`);
  return res.data.data;
};

  function DeveloperTotalDetails() {

  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["developerTotalDetails", id],
    queryFn:  () => fetchDeveloperDetails(id!),
    enabled:  !!id,
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading developer details...</p>
      </div>
    </div>
  );

  if (isError || !data?.developer) return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle size={24} className="text-red-400" />
        <p className="text-sm text-gray-500">Failed to load developer details.</p>
      </div>
    </div>
  );

  const { developer, interview, task } = data;


  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* Page Header */}
      <div className="mb-8">
          <Logo className="mb-2" size={24} textSize="text-[13px]" subTextSize="text-[7px]" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{developer.developerName}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {developer.position} · {developer.experience} yr{developer.experience !== 1 ? "s" : ""} experience
        </p>
      </div>

      <div className="space-y-4">
        <DeveloperDetailsSection dev={developer} />
        <InterviewSection        interview={interview} task={task} />
        <AISummarySection        summary={developer.aiSummary} />
        <TaskSection             task={task} />
        <ResumeSection           resumeUrl={developer.resumeUrl} />
      </div>

    </div>
  );
}

export default DeveloperTotalDetails;