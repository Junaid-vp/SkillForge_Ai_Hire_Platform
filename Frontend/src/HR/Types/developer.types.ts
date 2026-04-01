export interface Developer {
  id:            string;
  developerName: string;
  developerEmail:string;
  position:      string;
  experience:    number;
  interviewDate: string;
  interviewTime: string;
  uniqueCode:    string;
  resumeUrl:     string | null;
  aiSummary:     string | null;
  skills:        string | null;
}

export interface Interview {
  id:          string;
  scheduledAt: string | null;
  status:      "SCHEDULED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS";
}

export interface TaskLibrary {
  title:        string;
  description:  string;
  requirements: string;
  difficulty:   string;
  duration:     number;
  category:     string;
  techStack:    string;
}

export interface Task {
  id:          string;
  status:      "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  deadline:    string;
  taskLibrary: TaskLibrary | null;
}

export interface DevDetailsResponse {
  developer: Developer | null;
  interview: Interview | null;
  task:      Task      | null;
}

export const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:   "bg-blue-50   text-blue-600   border-blue-100",
  COMPLETED:   "bg-green-50  text-green-600  border-green-100",
  CANCELLED:   "bg-red-50    text-red-500    border-red-100",
  IN_PROGRESS: "bg-yellow-50 text-yellow-600 border-yellow-100",
  PENDING:     "bg-gray-100  text-gray-500   border-gray-200",
  FAILED:      "bg-red-50    text-red-500    border-red-100",
};

export const DIFFICULTY_STYLES: Record<string, string> = {
  EASY:   "bg-green-50  text-green-600  border-green-100",
  MEDIUM: "bg-yellow-50 text-yellow-600 border-yellow-100",
  HARD:   "bg-red-50    text-red-500    border-red-100",
};

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

export const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const parseSkills = (raw: string | null): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};