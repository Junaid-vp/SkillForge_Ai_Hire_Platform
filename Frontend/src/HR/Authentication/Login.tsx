import { useState } from 'react';
import { Formik, Form, Field, type FormikHelpers } from "formik";
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../Api/Axios';
import OTPModal from '../Components/Mod/OtpModal';
import { LoginValidation } from '../Validation/LoginValidation';

const initialValues = {
  email: "",
  password: "",
};

function Login() {
  const navigate = useNavigate();
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [Email, setEmail] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInvalid, setIsInvalid] = useState<null | string>(null);
  const [showPassword, setShowPassword] = useState(false);

  const HandleLogin = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    try {
      const Data = {
        email: values.email.toLowerCase(),
        password: values.password,
      };
      setEmail(values.email.toLowerCase());
      const res = await api.post("/auth/hr/login", Data);
      if (res.data.Status === "Success") {
        setShowOTP(true);
        setIsInvalid(null);
      } else {
        console.log(res.data.Message);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPConfirm = async (code: string) => {
    setIsVerifying(true);
    try {
      const res = await api.post("/auth/hr/verify-otp", { otp: code, email: Email });
      if (res.data.Status === "Success") {
        setShowOTP(false);
        setEmail("");
        setIsInvalid(null);
        navigate("/dashboard");
      } else {
        setIsInvalid("Invalid OTP");
      }
    } catch (e) {
      setIsInvalid("Invalid OTP");
      console.log(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReSentOtp = async () => {
    try {
      await api.post("/auth/hr/resent-otp", { email: Email.toLowerCase() }); // ✅ fixed typo
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-3.5 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <>
      <OTPModal
        isOpen={showOTP}
        onConfirm={handleOTPConfirm}
        onClose={() => setShowOTP(false)}
        isVerifying={isVerifying}
        isInvalid={isInvalid}
        reSentOtp={handleReSentOtp}
      />

      <div className="h-screen overflow-hidden bg-gray-50 font-sans antialiased text-gray-900 flex flex-col">

        {/* Navbar */}
        <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md z-50 shrink-0">
          <div className="container mx-auto px-6 h-14 max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                SkillForge <span className="text-blue-600">AI</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/rollselection')}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={13} />
              Back
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-blue-100/50 rounded-full blur-3xl" />

          <div className="relative w-full max-w-md">

            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600">HR / Employer</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500">Sign in to your SkillForge AI account.</p>
            </div>

            {/* Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 px-8 py-6">
              <Formik initialValues={initialValues} validationSchema={LoginValidation} onSubmit={HandleLogin}>
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-3">

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <Field
                        placeholder="you@company.com"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={inputClasses}
                      />
                      {errors.email && touched.email && (
                        <p className="mt-0.5 text-[10px] text-red-500">{String(errors.email)}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          placeholder="Enter your password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className={`${inputClasses} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showPassword
                            ? <EyeOff className="w-3.5 h-3.5" />
                            : <Eye className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                      {errors.password && touched.password && (
                        <p className="mt-0.5 text-[10px] text-red-500">{String(errors.password)}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <> Sign In <ArrowRight size={13} /> </>
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
                Don't have an account?{" "}
                <Link to="/SignUp" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <p className="mt-3 text-center text-[10px] text-gray-400">© 2026 SkillForge AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;