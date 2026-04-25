import { useState } from 'react';
import { Formik, Form, Field } from "formik";
import { LinkIcon, Send, CalendarDays, User, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { GeminiStar } from '../Components/Icons';
import toast from 'react-hot-toast';
import { api } from '../../Api/Axios';
import { InterviewValidation } from '../Validation/InterviewValidation';
 
const initialValues = {
  developerName: "",
  developerEmail: "",
  position: "",
  experience: "",
  skills: "",
  interviewDate: "",
  interviewTime: "",
};
 
// ✅ Dedicated type for resume API response data
interface ResumeData {
  name: string;
  resumeUrl: string;
  aiSummary: string;
  skills: string[];
}
 
function CreateInterview() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState(false);
 
  // ✅ Single clean state for all resume data (replaces the old File | null hack)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
 
  const handleResumeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    setIsParsing(true);
 
    try {
      const formDataObj = new FormData();
      formDataObj.append("resume", file);
 
      const res = await api.post("/resume/upload", formDataObj);

   
      const data = res.data.data;
 

   
      // ✅ Staggered population for a more "premium" AI feel
      const fields = [
        { name: "developerName",  value: data.developerName          ?? "" },
        { name: "developerEmail", value: data.developerEmail         ?? "" },
        { name: "position",       value: data.position               ?? "" },
        { name: "experience",     value: data.experience?.toString() ?? "" },
        { name: "skills",         value: (data.skills ?? []).join(", ") },
      ];

      for (let i = 0; i < fields.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 250)); // Subtle staggering
        setFieldValue(fields[i].name, fields[i].value);
      }
 

      setResumeData({
        name:      file.name,
        resumeUrl: data.resumeUrl  ?? "",
        aiSummary: data.aiSummary  ?? "",
        skills:    data.skills     ?? [],
      });
 
    } catch (e: any) {
      const msg = e?.response?.data?.Message || e?.response?.data?.message;
      toast.error(msg || 'Resume parsing failed. Please fill the fields manually.');
    } finally {
      setIsParsing(false);
    }
  };
 
  const HandleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    if (!generatedCode) {
      toast.error('Please generate a unique invite code first.');
      setSubmitting(false);
      return;
    }
 
    try {
      const Data = {
        developerName:  values.developerName,
        developerEmail: values.developerEmail,
        position:       values.position,
        experience:     values.experience,
        interviewDate:  values.interviewDate,
        interviewTime:  values.interviewTime,
        uniqueCode:     generatedCode,
        // ✅ Clean access — no more optional chaining on File type
        resumeUrl:      resumeData?.resumeUrl ?? null,
        aiSummary:      resumeData?.aiSummary ?? null,
        skills:         values.skills, // Send explicitly filled skills
      };
 
      await api.post('/interview/schedule', Data);
 
      resetForm();
      setGeneratedCode(null);
      setResumeData(null);
      setSubmitted(true);
      toast.success('Interview invitation sent successfully!');
      setTimeout(() => setSubmitted(false), 3000);
 
    } catch (e: any) {
      // error handled by toast
      const msg = e?.response?.data?.Message || e?.response?.data?.message;
      toast.error(msg || 'Failed to send invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/interview/generate-code');
      setGeneratedCode(res.data.Code);
      toast.success('Invite code generated!');
    } catch (e) {
      toast.error('Failed to generate invite code. Please try again.');
      
    } finally {
      setIsGenerating(false);
    }
  };
 
  const inputClasses =
    "w-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
 
  return (
    <div className="max-w-4xl mx-auto pb-10">
 
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <GeminiStar size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            HR Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Interview</h1>
        <p className="text-sm text-gray-400 mt-1">Invite a developer for a technical interview</p>
      </div>
 
      {/* Success banner */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-3.5 mb-5">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Invitation sent successfully!</p>
            <p className="text-xs text-green-600 mt-0.5">
              The developer will receive an email with the interview details.
            </p>
          </div>
        </div>
      )}
 
      <Formik
        initialValues={initialValues}
        validationSchema={InterviewValidation}
        onSubmit={HandleSubmit}
      >
        {({ errors, touched, isSubmitting, resetForm, setFieldValue, values }) => (
          <Form className="space-y-4">
 
            {/* Section 1 — Developer Information */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-gray-800">Developer Information</h2>
                    <p className="text-[11px] text-gray-400">
                      Enter the candidate's details or upload a resume
                    </p>
                  </div>
                </div>
 
                {/* Resume Upload / Badge */}
                <div className="shrink-0">
                  {/* ✅ Condition now uses resumeData instead of resumeFile */}
                  {!resumeData ? (
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-500 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all">
                      {isParsing ? (
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      ) : (
                        <Upload size={11} />
                      )}
                      {isParsing ? 'Parsing...' : 'Upload Resume'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleResumeUpload(e, setFieldValue)}
                        disabled={isParsing}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                      <FileText size={11} className="text-blue-500" />
                      {/* ✅ Display the original file name from resumeData.name */}
                      <span className="text-[11px] font-medium text-blue-600 max-w-[120px] truncate">
                        {resumeData.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setResumeData(null)}   // ✅ clear resumeData
                        className="text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
 
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Developer Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Field
                        placeholder="John Doe"
                        name="developerName"
                        type="text"
                        disabled={isParsing}
                        className={`${inputClasses} ${isParsing ? 'text-transparent select-none border-blue-200' : ''} ${isParsing ? 'animate-border-glow' : ''} pr-10`}
                      />
                      {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer-premium" />
                        </div>
                      )}
                      {resumeData && !isParsing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-500">
                          <GeminiStar size={10} className="text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    {errors.developerName && touched.developerName && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.developerName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Developer Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Field
                        placeholder="john@example.com"
                        name="developerEmail"
                        type="email"
                        disabled={isParsing}
                        className={`${inputClasses} ${isParsing ? 'text-transparent select-none border-blue-200' : ''} ${isParsing ? 'animate-border-glow' : ''} pr-10`}
                      />
                      {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer-premium" />
                        </div>
                      )}
                      {resumeData && !isParsing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-500">
                          <GeminiStar size={10} className="text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    {errors.developerEmail && touched.developerEmail && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.developerEmail}</p>
                    )}
                  </div>
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Position <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Field
                        placeholder="Senior Full Stack Developer"
                        name="position"
                        type="text"
                        disabled={isParsing}
                        className={`${inputClasses} ${isParsing ? 'text-transparent select-none border-blue-200' : ''} ${isParsing ? 'animate-border-glow' : ''} pr-10`}
                      />
                      {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer-premium" />
                        </div>
                      )}
                      {resumeData && !isParsing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-500">
                          <GeminiStar size={10} className="text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    {errors.position && touched.position && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.position}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Experience Level <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Field
                        placeholder="5+ years"
                        name="experience"
                        type="text"
                        disabled={isParsing}
                        className={`${inputClasses} ${isParsing ? 'text-transparent select-none border-blue-200' : ''} ${isParsing ? 'animate-border-glow' : ''} pr-10`}
                      />
                      {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer-premium" />
                        </div>
                      )}
                      {resumeData && !isParsing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-500">
                          <GeminiStar size={10} className="text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    {errors.experience && touched.experience && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.experience}</p>
                    )}
                  </div>
                </div>

                {/* Skills Field */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Skills <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Field
                        placeholder="React, Node.js, TypeScript (comma separated)"
                        name="skills"
                        type="text"
                        disabled={isParsing}
                        className={`${inputClasses} ${isParsing ? 'text-transparent select-none border-blue-200' : ''} ${isParsing ? 'animate-border-glow' : ''} pr-10`}
                      />
                      {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer-premium" />
                        </div>
                      )}
                      {resumeData && !isParsing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-500">
                          <GeminiStar size={10} className="text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                    {errors.skills && touched.skills && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.skills}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
 
            {/* Section 2 — Schedule Interview */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarDays size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">Schedule Interview</h2>
                  <p className="text-[11px] text-gray-400">Set the interview date and time</p>
                </div>
              </div>
 
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Interview Date <span className="text-red-400">*</span>
                    </label>
                    <Field name="interviewDate" type="date" className={inputClasses} />
                    {errors.interviewDate && touched.interviewDate && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.interviewDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Interview Time <span className="text-red-400">*</span>
                    </label>
                    <Field name="interviewTime" type="time" className={inputClasses} />
                    {errors.interviewTime && touched.interviewTime && (
                      <p className="mt-1 text-[10px] text-red-500">{errors.interviewTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
 
            {/* Section 3 — Generate Invite Code */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <LinkIcon size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">Generate Invite Code</h2>
                  <p className="text-[11px] text-gray-400">
                    Create a unique code for the developer to access the interview
                  </p>
                </div>
              </div>
 
              <div className="p-6">
                {!generatedCode ? (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={
                      isGenerating ||
                      !values.developerName ||
                      !values.developerEmail ||
                      !values.position ||
                      !values.experience ||
                      !values.skills ||
                      !values.interviewDate ||
                      !values.interviewTime
                    }
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-100"
                  >
                    {isGenerating
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <LinkIcon size={14} />
                    }
                    {isGenerating ? 'Generating...' : 'Generate Unique Invite Code'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5">
                    <div>
                      <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider mb-0.5">
                        Invite Code
                      </p>
                      <code className="text-base font-mono font-bold text-blue-600 tracking-[0.2em]">
                        {generatedCode}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors font-medium border border-gray-200 bg-white px-2.5 py-1 rounded-lg"
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
 
            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                // ✅ Clear now resets resumeData instead of resumeFile
                onClick={() => { resetForm(); setGeneratedCode(null); setResumeData(null); }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send size={13} /> Send Invitation Email</>
                )}
              </button>
            </div>
 
          </Form>
        )}
      </Formik>
    </div>
  );
}
 
export default CreateInterview;