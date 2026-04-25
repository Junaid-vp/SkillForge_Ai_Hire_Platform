import {  useState } from "react";
import toast from 'react-hot-toast';
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../Api/Axios";
import {
  Sparkles,
  BookOpen,
  Clock,
  BarChart2,
  Code2,
  Layers,
  Pencil,
  Trash2,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import DeleteConfirmModal from "../Components/Mod/DeleteConformModal";
import { useQuery } from "@tanstack/react-query";
import TaskAssignModal from "../Components/Mod/TaskAssignModal";

interface TaskLibrary {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  category: string;
  techStack: string;
  difficulty: string;
  duration: number;
  usedCount: number;
  isDefault: boolean;
  createdAt: Date;
}

const difficultyConfig: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  easy: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  hard: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  expert: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
};

const fetchSpecificData = async (id: string) => {
  const res = await api.get(`/tasklibary/specifictask/${id}`);
  return res.data.data;
};

function TaskPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleted, setDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAssignModal,setShowAssignModal] = useState(false)
  const[isAssgin,setIsAssgin] = useState(false)
  const { data, isLoading,  } = useQuery<TaskLibrary>({
    queryKey: ["SpecificData", id],
    queryFn: () => fetchSpecificData(id!),
    enabled: !!id,
  });


  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/tasklibary/delete/${id}`);
      setShowDeleteModal(false);
      setDeleted(true);
      toast.success('Task deleted successfully!');
      setTimeout(() => navigate("/dashboard/task-library"), 2000);
    } catch (e: any) {
      
      toast.error(e?.response?.data?.Message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

 const handleTaskAssign = async (code: string) => {
  setIsAssgin(true);
  try {
    await api.post("/task/taskassgin", { code, libaryId: data?.id });
    setShowAssignModal(false);
    toast.success('Task assigned successfully!')
    
  } catch (e: any) {
    // error handled by toast
    toast.error(e?.response?.data?.Message || 'Failed to assign task.');
    throw e;
  } finally {
    setIsAssgin(false);
  }
 };


  const diff = data
    ? difficultyConfig[data.difficulty.toLowerCase()] ?? {
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      }
    : null;

  const requirements = data?.requirements || [];

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto pb-10 space-y-4">
        <div className="h-7 bg-gray-100 rounded w-48 animate-pulse mb-8" />
        <div className="bg-white border border-gray-100 rounded-2xl p-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="max-w-3xl mx-auto pb-10">
        <div className="bg-white border border-red-100 rounded-2xl p-12 text-center">
          <p className="text-sm font-semibold text-red-500">Task not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-xs text-blue-600 font-semibold"
          >
            Go back
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          taskTitle={data.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showAssignModal && (
        <TaskAssignModal
        taskTitle={data.title}
          isAssgin={isAssgin}
          onConfirm={handleTaskAssign}
          onCancel={() => setShowAssignModal(false)}
        />
      )}

      {/* Deleted banner */}
      {deleted && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 mb-5">
          <CheckCircle2 size={16} className="text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">
            Task deleted. Redirecting...
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            HR Portal
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 mb-2 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Library
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Task Preview
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Full details of this interview task
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-green-100"
            >
              <UserPlus size={13} />
              Assign Task
            </button>

            {!data.isDefault && (
              <>
                <button
                  onClick={() => navigate(`/dashboard/task-edit/${id}`)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-100"
                >
                  <Pencil size={13} />
                  Update
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <BookOpen size={13} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">{data.title}</h2>
              {data.isDefault && (
                <span className="text-[9px] font-semibold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {diff && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border} capitalize`}
                >
                  {data.difficulty}
                </span>
              )}
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {data.duration} Day
                {data.duration !== 1 ? "s" : ""}
              </span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Layers size={10} /> {data.category}
              </span>
              <span className="text-[10px] text-gray-400">
                Used {data.usedCount} time{data.usedCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
              Description
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {data.description}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-3">
              Requirements ({requirements.length})
            </p>
            <div className="space-y-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-blue-600">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{req}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Code2 size={10} /> Tech Stack
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.techStack?.split(",").map((t, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-lg"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={12} className="text-blue-400" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
              Difficulty
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900 capitalize">
            {data.difficulty}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-blue-400" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
              Duration
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {data.duration} Day{data.duration !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={12} className="text-blue-400" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
              Times Used
            </p>
          </div>
          <p className="text-sm font-bold text-gray-900">{data.usedCount}</p>
        </div>
      </div>
    </div>
  );
}

export default TaskPreview;
