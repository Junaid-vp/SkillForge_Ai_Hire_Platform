import { useState } from 'react';
import toast from 'react-hot-toast';

import { Formik, Form, Field } from "formik";
import { Link, useNavigate } from 'react-router-dom';
import {  Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Logo, Bolt } from '../Components/Icons';
import { api } from '../../Api/Axios';
import { SignUPValidation } from '../Validation/SignUpValidation';

interface HrDetails {
  name: string;
  email: string;
  companyName: string;
  designation: string;
  companyWebsite: string;
  password: string;
}

const initialValues  = {
  Name: "",
  Email: "",
  CompanyName: "",
  Designation: "",
  CompanyWebsite: "",
  Password: ""
};

function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const HandleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void; }
  ) => {
    try {
      const Data : HrDetails = {
        name: values.Name,
        email: values.Email.toLowerCase(),
        companyName: values.CompanyName,
        designation: values.Designation,
        companyWebsite: values.CompanyWebsite,
        password: values.Password
      };
       
      const response  = await api.post('/auth/hr/register',Data)

       if(response.status ===201){
        resetForm();
        toast.success('Account created successfully! Please sign in.');
        navigate("/login");
       }
      
    } catch (e: any) {
      // error handled by toast
      const msg = e?.response?.data?.Message || e?.response?.data?.message;
      if (msg?.toLowerCase().includes('already') || e?.response?.status === 409) {
        toast.error('An HR account with this email already exists.');
      } else {
        toast.error(msg || 'Error creating account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-3.5 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <div className="h-screen overflow-hidden bg-gray-50 font-sans antialiased text-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md z-50 shrink-0">
        <div className="container mx-auto px-6 h-14 max-w-7xl flex items-center justify-between">
          <Logo className="cursor-pointer" onClick={() => navigate('/')} />
          <button
            onClick={() => navigate('/rollselection')}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3">
              <Bolt className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600">HR / Employer</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Start evaluating candidates with AI today.</p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 px-8 py-6">

            <Formik
              initialValues={initialValues}
              validationSchema={SignUPValidation}
              onSubmit={HandleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-3">

                  {/* Row 1 — Full Name + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <Field placeholder="John Doe" id="Name" name="Name" type="text" autoComplete="name" className={inputClasses} />
                      {errors.Name && touched.Name && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.Name)}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <Field placeholder="you@company.com" id="Email" name="Email" type="email" autoComplete="email" className={inputClasses} />
                      {errors.Email && touched.Email && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.Email)}</p>}
                    </div>
                  </div>

                  {/* Row 2 — Company + Designation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <Field placeholder="Acme Inc." id="CompanyName" name="CompanyName" type="text" autoComplete="organization" className={inputClasses} />
                      {errors.CompanyName && touched.CompanyName && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.CompanyName)}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Designation <span className="text-red-400">*</span>
                      </label>
                      <Field placeholder="HR Manager" id="Designation" name="Designation" type="text" autoComplete="organization-title" className={inputClasses} />
                      {errors.Designation && touched.Designation && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.Designation)}</p>}
                    </div>
                  </div>

                  {/* Row 3 — Website full width */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Company Website <span className="text-red-400">*</span>
                    </label>
                    <Field placeholder="https://www.acme.com" id="CompanyWebsite" name="CompanyWebsite" type="url" autoComplete="url" className={inputClasses} />
                    {errors.CompanyWebsite && touched.CompanyWebsite && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.CompanyWebsite)}</p>}
                  </div>

                  {/* Row 4 — Password full width */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        placeholder="Create a strong password"
                        id="Password"
                        name="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`${inputClasses} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.Password && touched.Password && <p className="mt-0.5 text-[10px] text-red-500">{String(errors.Password)}</p>}
                  </div>

                  {/* Submit */}
                  <div className="pt-1">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <> Create Account <ArrowRight size={13} /> </>
                      )}
                    </button>
                  </div>

                </Form>
              )}
            </Formik>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-[13px] text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                Sign in
              </Link>
            </p>

          </div>

          <p className="mt-3 text-center text-[10px] text-gray-400">© 2026 SkillForge AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;