import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import {
  BookOpen,
  CheckCircle2,
  Send,
  Layers,
  Clock,
  BarChart2,
  Code2,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "../Components/Icons";

import toast from 'react-hot-toast';
import { api } from "../../Api/Axios";
import { TaskValidation } from "../Validation/TaskLibaryValidation";
import { useParams, useNavigate } from "react-router-dom";

const initialValues = {
  title: "",
  description: "",
  requirements: "",
  category: "",
  techStack: "",
  difficulty: "",
  duration: "" as unknown as number,
};

function TaskLibraryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [loadingTask, setLoadingTask] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const fetchTask = async () => {
      setLoadingTask(true);
      try {
        const res = await api.get(`/tasklibary/specifictask/${id}`);
        const t = res.data.data;

        let requirements = t.requirements.split("|").join("\n");

        setFormValues({
          title: t.title,
          description: t.description,
          requirements,
          category: t.category,
          techStack: t.techStack,
          difficulty: t.difficulty,
          duration: t.duration,
        });
      } catch (_e) {
        // error handled by toast
        toast.error('Failed to load task details.');
      } finally {
        setLoadingTask(false);
      }
    };
    fetchTask();
  }, [id]);

  const HandleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    },
  ) => {
    try {
      const Data = {
        title: values.title,
        description: values.description,
        requirements: values.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r)
          .join("|"),
        category: values.category,
        techStack: values.techStack,
        difficulty: values.difficulty,
        duration: Number(values.duration),
      };

      if (isEdit) {
        await api.patch(`/tasklibary/update/${id}`, Data);
      } else {
        await api.post("/tasklibary/create", Data);
        resetForm();
      }

      setSubmitted(true);
      toast.success(isEdit ? 'Task updated successfully!' : 'Task created successfully!');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e: any) {
      // error handled by toast
      const msg = e?.response?.data?.Message || e?.response?.data?.message;
      toast.error(msg || 'Error saving task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  if (loadingTask)
    return (
      <div className="max-w-4xl mx-auto pb-10 space-y-4">
        <div className="mb-8 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
          <div className="h-7 bg-gray-100 rounded w-48 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-64 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse space-y-3"
          >
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-20 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Logo className="mb-2" size={24} textSize="text-[13px]" subTextSize="text-[7px]" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? "Edit Task" : "Task Library"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isEdit
                ? "Update the details of this interview task"
                : "Create and manage technical interview tasks"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={13} />
              Back
            </button>
            {isEdit && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                <Pencil size={11} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">
                  Editing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-3.5 mb-5">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              {isEdit
                ? "Task updated successfully!"
                : "Task created successfully!"}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {isEdit
                ? "The task has been updated in your library."
                : "The task has been added to your library."}
            </p>
          </div>
        </div>
      )}

      <Formik
        initialValues={formValues}
        enableReinitialize
        validationSchema={TaskValidation}
        onSubmit={HandleSubmit}
      >
        {({ errors, touched, isSubmitting, resetForm }) => (
          <Form className="space-y-4">
            {/* Section 1 — Task Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">
                    Task Information
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Basic details about the task
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Task Title <span className="text-red-400">*</span>
                  </label>
                  <Field
                    placeholder="e.g. Build a REST API with authentication"
                    name="title"
                    type="text"
                    className={inputClasses}
                  />
                  {errors.title && touched.title && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Field
                    as="textarea"
                    placeholder="Describe what the candidate needs to build or solve..."
                    name="description"
                    rows={4}
                    className={`${inputClasses} resize-none`}
                  />
                  {errors.description && touched.description && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Requirements <span className="text-red-400">*</span>
                  </label>
                  <Field
                    as="textarea"
                    placeholder={
                      "Each requirement on a new line\ne.g.\nImplement Trie from scratch\nReturn top 5 suggestions\nWrite unit tests"
                    }
                    name="requirements"
                    rows={5}
                    className={`${inputClasses} resize-none`}
                  />
                  {errors.requirements && touched.requirements && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400">
                    Enter each requirement on a new line
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 — Tech & Category */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Code2 size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">
                    Tech & Category
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Specify the technology and task category
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Layers size={11} className="text-gray-400" />
                        Category <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <Field
                      placeholder="e.g. MERN Stack, Python"
                      name="category"
                      type="text"
                      list="category-suggestions"
                      className={inputClasses}
                    />
                    <datalist id="category-suggestions">
                      <option value="Frontend" />
                      <option value="Backend" />
                      <option value="Full Stack" />
                      <option value="MERN Stack" />
                      <option value="DevOps" />
                      <option value="Mobile" />
                      <option value="Database" />
                      <option value="Algorithms & DSA" />
                      <option value="Python" />
                      <option value="Java" />
                      <option value="Cloud & AWS" />
                      <option value="Machine Learning" />
                      <option value="System Design" />
                    </datalist>
                    {errors.category && touched.category && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Code2 size={11} className="text-gray-400" />
                        Tech Stack <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <Field
                      placeholder="e.g. React, Node.js, MongoDB"
                      name="techStack"
                      type="text"
                      list="techstack-suggestions"
                      className={inputClasses}
                    />
                    <datalist id="techstack-suggestions">
                      <option value="React, Node.js, MongoDB" />
                      <option value="React, Node.js, PostgreSQL" />
                      <option value="Next.js, TypeScript, Prisma" />
                      <option value="Vue.js, Express, MySQL" />
                      <option value="Python, Django, PostgreSQL" />
                      <option value="Python, FastAPI, MongoDB" />
                      <option value="Java, Spring Boot, MySQL" />
                      <option value="TypeScript, Jest" />
                      <option value="React Native, Expo" />
                      <option value="Docker, Kubernetes, AWS" />
                    </datalist>
                    {errors.techStack && touched.techStack && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.techStack}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 — Difficulty & Duration */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart2 size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">
                    Difficulty & Duration
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Set the challenge level and time limit
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <BarChart2 size={11} className="text-gray-400" />
                        Difficulty <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <Field
                      placeholder="e.g. Easy, Medium, Hard"
                      name="difficulty"
                      type="text"
                      list="difficulty-suggestions"
                      className={inputClasses}
                    />
                    <datalist id="difficulty-suggestions">
                      <option value="Easy" />
                      <option value="Medium" />
                      <option value="Hard" />
                      <option value="Expert" />
                    </datalist>
                    {errors.difficulty && touched.difficulty && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.difficulty}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} className="text-gray-400" />
                        Duration (days) <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <Field
                      placeholder="e.g. 3"
                      name="duration"
                      type="number"
                      min="1"
                      className={inputClasses}
                    />
                    {errors.duration && touched.duration && (
                      <p className="mt-1 text-[10px] text-red-500">
                        {errors.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => resetForm()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEdit ? (
                  <>
                    <Pencil size={13} /> Update Task
                  </>
                ) : (
                  <>
                    <Send size={13} /> Create Task
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default TaskLibraryEdit;
