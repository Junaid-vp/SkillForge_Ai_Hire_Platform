import { useState } from "react";
import { api } from "../../Api/Axios";
import toast from 'react-hot-toast';
import DeleteConfirmModal from "../Components/Mod/DeleteConformModal";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  Clock,
  BarChart2,
  Code2,
  Layers,
  Pencil,
  Trash2,
  Plus,
  Eye,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

const fetchLibraryData = async (category: string) => {
  let url = "/tasklibary/alltask";
  if (category === "Defaults") {
    url += "?isDefault=true";
  } else if (category !== "ALL") {
    url += `?category=${encodeURIComponent(category)}`;
  }
  const res = await api.get(url);
  return res.data.data;
};

const fetchCategories = async () => {
  const res = await api.get("/tasklibary/categories");
  return res.data.data || [];
};

function TaskLibraryList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<TaskLibrary[]>({
    queryKey: ["TaskLibary", activeCategory],
    queryFn: () => fetchLibraryData(activeCategory),
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["TaskCategories"],
    queryFn: fetchCategories,
  });

  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (task: { id: string; title: string }) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasklibary/delete/${taskToDelete.id}`);
      toast.success('Task deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ["TaskLibrary"] });
      setTaskToDelete(null);
    } catch (e: any) {
      
      toast.error(e?.response?.data?.Message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyStyle = (difficulty: string) =>
    difficultyConfig[difficulty.toLowerCase()] ?? {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
    };

  return (
    <div className="max-w-5xl mx-auto pb-10">
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Task Library
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your technical interview tasks
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/task-create")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-100"
          >
            <Plus size={13} />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-full max-w-[240px]">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-all text-xs font-semibold text-gray-700"
          >
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-blue-500" />
              <span className="text-gray-400 font-medium">Category:</span>
              <span className="text-gray-900">{activeCategory.toUpperCase()}</span>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                {["ALL", "Defaults", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${
                      activeCategory === cat
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-100 rounded-lg" />
                  <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                  <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-red-500">
            Failed to load tasks
          </p>
          <p className="text-xs text-gray-400 mt-1">Please try again later</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && data && data.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={20} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No tasks yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Create your first task to get started
          </p>
          <button
            onClick={() => navigate("/dashboard/task-library")}
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={13} /> Create Task
          </button>
        </div>
      )}

      {/* Task Cards */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((task) => {
            const diff = getDifficultyStyle(task.difficulty);
            const requirementsArray = Array.isArray(task.requirements) 
              ? task.requirements 
              : (typeof (task.requirements as any) === "string" ? (task.requirements as any).split("|").filter((r: string) => r.trim()) : []);
            const requirementCount = requirementsArray.length;

            return (
              <div
                key={task.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {task.title}
                      </p>
                      {task.isDefault && (
                        <span className="shrink-0 text-[9px] font-semibold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {task.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/task-preview/${task.id}`)
                      }
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Eye size={11} /> Preview
                    </button>

                    {!task.isDefault && (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/task-edit/${task.id}`)
                          }
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick({ id: task.id, title: task.title })}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Card details */}
                <div className="flex items-center gap-6 px-6 py-3">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <Layers size={11} className="text-gray-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                        Category
                      </p>
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {task.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Code2 size={11} className="text-gray-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                        Stack
                      </p>
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {task.techStack}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <Clock size={11} className="text-gray-300 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                        Duration
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {task.duration}d
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-28 shrink-0">
                    <BarChart2 size={11} className="text-gray-300 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                        Difficulty
                      </p>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border} capitalize`}
                      >
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50/60 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">
                      {requirementCount} requirement
                      {requirementCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-gray-400 border-l border-gray-200 pl-3">
                      Added {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Used{" "}
                    <strong className="text-gray-600">{task.usedCount}</strong>{" "}
                    time{task.usedCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {taskToDelete && (
        <DeleteConfirmModal
          taskTitle={taskToDelete.title}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  );
}

export default TaskLibraryList;
