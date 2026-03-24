import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import {
  Sparkles, CheckCircle2, Send, User, Building2,
  Globe, Briefcase, X, CreditCard, CalendarDays,
  Mail, Activity, ArrowUpCircle, Settings as SettingsIcon,
} from "lucide-react";
import { api } from "../../Api/Axios";
import { SettingsValidation } from "../Validation/SettingValidation";
import ChangePassForm from "../Components/ChangePassForm";
import Notification from "../Components/Notification";

interface Profile {
  email: string;
  name: string;
  companyName: string;
  designation: string | null;
  companyWebsite: string;
  createdAt: string;
  plan: string;
  interviewCount: number;
  interviewLimit: number;
}

const initialValues = {
  name: "",
  companyName: "",
  designation: "",
  companyWebsite: "",
};

function Settings() {
  const [formValues, setFormValues] = useState(initialValues);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
   
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/setting/hrSpecificDetails");
        const hr = res.data.Hr;
        setFormValues({
          name:           hr.name          ?? "",
          companyName:    hr.companyName   ?? "",
          designation:    hr.designation   ?? "",
          companyWebsite: hr.companyWebsite ?? "",
        });
        setProfile(hr);
      } catch (e) {
        console.error("Failed to fetch HR profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    try {
      await api.post("/setting/update", values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (profile) setProfile({ ...profile, ...values });
      setFormValues(values);

    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  if (loading) return (
    <div className="max-w-3xl mx-auto pb-10 space-y-4">
      <div className="mb-8 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
        <div className="h-7 bg-gray-100 rounded w-36 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-56 animate-pulse" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );

  const usagePercent = profile
    ? Math.min(Math.round((profile.interviewCount / profile.interviewLimit) * 100), 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto pb-10">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">HR Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your profile, company information, security, and preferences</p>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-3.5 mb-5">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Profile updated successfully!</p>
            <p className="text-xs text-green-600 mt-0.5">Your changes have been saved.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">

        {/* Account Info + Plan — 2 cards */}
        {profile && (
          <div className="grid grid-cols-2 gap-4">

            {/* Account Details */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User size={13} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-800">Account Details</h2>
                  <p className="text-[11px] text-gray-400">Your account information</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-1.5">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-400 shrink-0" />
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-1.5">Member Since</p>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={12} className="text-gray-400 shrink-0" />
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan & Usage */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={13} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xs font-semibold text-gray-800">Current Plan</h2>
                  <p className="text-[11px] text-gray-400">Your subscription details</p>
                </div>
                <span className="text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {profile.plan}
                </span>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <Activity size={11} className="text-gray-400" />
                      Interviews Used
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {profile.interviewCount} / {profile.interviewLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {usagePercent > 80 ? '⚠ Approaching limit' : 'Healthy usage'}
                  </p>
                </div>
                <button className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm shadow-blue-100">
                  <ArrowUpCircle size={13} />
                  Upgrade Plan
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Editable Form */}
        <Formik
          initialValues={formValues}
          enableReinitialize
          validationSchema={SettingsValidation}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, resetForm }) => (
            <Form className="space-y-4">

              {/* Section 1 — Personal Info */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-gray-800">Personal Details</h2>
                    <p className="text-[11px] text-gray-400">Your name and role</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <Field name="name" type="text" placeholder="e.g. John Doe" className={inputClasses} />
                      {errors.name && touched.name && <p className="mt-1 text-[10px] text-red-500">{String(errors.name)}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={11} className="text-gray-400" />
                          Designation <span className="text-red-400">*</span>
                        </span>
                      </label>
                      <Field name="designation" type="text" placeholder="e.g. Senior HR Manager" className={inputClasses} />
                      {errors.designation && touched.designation && <p className="mt-1 text-[10px] text-red-500">{String(errors.designation)}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 — Company Info */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-gray-800">Company Information</h2>
                    <p className="text-[11px] text-gray-400">Details about your company</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <Field name="companyName" type="text" placeholder="e.g. Google" className={inputClasses} />
                      {errors.companyName && touched.companyName && <p className="mt-1 text-[10px] text-red-500">{String(errors.companyName)}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Globe size={11} className="text-gray-400" />
                          Company Website <span className="text-red-400">*</span>
                        </span>
                      </label>
                      <Field name="companyWebsite" type="url" placeholder="https://www.yourcompany.com" className={inputClasses} />
                      {errors.companyWebsite && touched.companyWebsite && <p className="mt-1 text-[10px] text-red-500">{String(errors.companyWebsite)}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => resetForm({ values: formValues, errors: {}, touched: {} })}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <X size={13} /> Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={13} /> Save Changes</>
                  )}
                </button>
              </div>

            </Form>
          )}
        </Formik>

        <ChangePassForm/>
        <Notification/>
      </div>
    </div>
  );
}

export default Settings;