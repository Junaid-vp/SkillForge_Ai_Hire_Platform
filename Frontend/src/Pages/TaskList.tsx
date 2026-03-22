import { useEffect, useState } from "react";
import { api } from "../Api/Axios";
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
} from "lucide-react";

interface TaskLibrary {
  id: string;
  title: string;
  description: string;
  requirements: string;
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

function TaskLibraryList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/tasklibary/alltask");
        setTasks(res.data.data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasklibary/delete/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
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
      {!isLoading && !error && tasks.length === 0 && (
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
      {!isLoading && !error && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const diff = getDifficultyStyle(task.difficulty);
            let requirementCount = 0;
            requirementCount = task.requirements
              ? task.requirements.split("|").filter((r) => r.trim()).length
              : 0;

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
                          onClick={() => handleDelete(task.id)}
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
                  <span className="text-[11px] text-gray-400">
                    {requirementCount} requirement
                    {requirementCount !== 1 ? "s" : ""}
                  </span>
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
    </div>
  );
}

export default TaskLibraryList;
