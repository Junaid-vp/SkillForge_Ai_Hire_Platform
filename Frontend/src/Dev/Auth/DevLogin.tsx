import { useState, useCallback, useEffect } from "react";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import toast from 'react-hot-toast';
import { api } from "../../Api/Axios";
import DevOtpModal from "../Components/DevOtpModal";
import { DevLoginValidation } from "../Validation/DevLoginValidation";

const initialValues = {
  email: "",
  uniqueCode: "",
};

function DevLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [uniqueCode,setUniqueCode ] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInvalid, setIsInvalid] = useState<null | string>(null);
  const [showUniqueCode, setShowUniqueCode] = useState(false);
  const token  = searchParams.get("token");



  useEffect(() => {
    if (!token) return;

    const MagicLogin = async () => {
      try {
        const res = await api.post("/dev/magicLink", { token });

        if (res.data.Status === "success") {
          navigate("/devDashboard");
        } else {
          setIsInvalid(res.data?.Message || "Magic link login failed");
          toast.error(res.data?.Message || 'Magic link login failed.');
        }
      } catch (e: any) {
        setIsInvalid(
          e?.response?.data?.Message || "Invalid or expired magic link",
        );
        toast.error(e?.response?.data?.Message || 'Invalid or expired magic link.');
      }
    };

    MagicLogin();
  }, [token, navigate]);


  const HandleLogin = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      const data = {
        email: values.email.toLowerCase(),
        code: values.uniqueCode,
      };

      setEmail(values.email.toLowerCase());
      setUniqueCode(values.uniqueCode)

      const res = await api.post("/dev/login", data);
console.log(res);

      if (res.data.Status === "Success") {
        setShowOTP(true);
        setIsInvalid(null);
        toast.success('OTP sent to your email!');
      } else {
        setIsInvalid(res.data.Message || "Login failed. Please try again.");
        toast.error(res.data.Message || 'Login failed. Please check your credentials.');
      }
    } catch (e: any) {
      setIsInvalid(
        e?.response?.data?.message || "Something went wrong. Please try again.",
      );
      toast.error(e?.response?.data?.Message || 'Invalid email or unique code.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPConfirm = useCallback(async (code: string) => {
    setIsVerifying(true);
    try {
      const res = await api.post("/dev/otpValidation", { otp: code, email, uniqueCode });

      if (res.data.Status === "Success") {
        setShowOTP(false);
        setEmail("");
        setUniqueCode("")
        setIsInvalid(null);
        toast.success('Login successful! Welcome.');
        navigate("/devDashboard");
      } else {
        setIsInvalid(res.data.Message || "Invalid OTP. Please try again.");
      }
    } catch (e: any) {
      setIsInvalid(e?.response?.data?.Message || "Invalid OTP. Please try again.");
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  }, [email, uniqueCode, navigate]);

  const handleResendOtp = async () => {
    try {
      await api.post("/dev/ResendOtp", { email: email.toLowerCase() });
      setIsInvalid(null);
      toast.success('New OTP sent to your email!');
    } catch (e: any) {
      console.error("Resend OTP error:", e.message);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const inputClasses =
    "w-full bg-gray-50 px-3.5 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <>
      <DevOtpModal
        isOpen={showOTP}
        onConfirm={handleOTPConfirm}
        onClose={() => setShowOTP(false)}
        isVerifying={isVerifying}
        isInvalid={isInvalid}
        reSentOtp={handleResendOtp}
      />

      <div className="h-screen overflow-hidden bg-gray-50 font-sans antialiased text-gray-900 flex flex-col">
        {/* Navbar */}
        <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md z-50 shrink-0">
          <div className="container mx-auto px-6 h-14 max-w-7xl flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                SkillForge <span className="text-blue-600">AI</span>
              </span>
            </div>
            <button
              onClick={() => navigate("/rollselection")}
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
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Developer
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                Welcome Developer
              </h1>
              <p className="text-sm text-gray-500">
                Sign in and attend your interview to prove your skills
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 px-8 py-6">
              <Formik
                initialValues={initialValues}
                validationSchema={DevLoginValidation}
                onSubmit={HandleLogin}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-3">
                    {/* Global error */}
                    {isInvalid && !showOTP && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        <p className="text-xs text-red-600 font-medium">
                          {isInvalid}
                        </p>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <Field
                        name="email"
                        type="email"
                        placeholder="your@gmail.com"
                        autoComplete="email"
                        className={inputClasses}
                      />
                      {errors.email && touched.email && (
                        <p className="mt-0.5 text-[10px] text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Unique Code */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unique Code <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          name="uniqueCode"
                       
                          type={showUniqueCode ? "text" : "password"}
                          placeholder="Enter your unique invitation code"
                          autoComplete="current-password"
                          className={`${inputClasses} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowUniqueCode(!showUniqueCode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showUniqueCode ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      
                      {errors.uniqueCode && touched.uniqueCode && (
                        <p className="mt-0.5 text-[10px] text-red-500">
                          {errors.uniqueCode}
                        </p>
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
                          <>
                            Sign In <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            <p className="mt-3 text-center text-[10px] text-gray-400">
              © 2026 SkillForge AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DevLogin;
