import { useState, useRef } from 'react';
import { Formik, Form, Field, type FormikHelpers, type FormikProps } from "formik";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

import { api } from '../../Api/Axios';
import PassConformationOtpModal from './Mod/PassConformationOtpModal';
import { ChangePassValidation } from '../Validation/ChangePassValidation';



const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function ChangePassForm() {
  const [showOTP, setShowOTP] = useState<boolean>(false);
  const [newPasswordStore, setNewPasswordStore] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInvalid, setIsInvalid] = useState<null | string>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const formRef = useRef<FormikProps<typeof initialValues>>(null);

  const HandleChange = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setNewPasswordStore(values.newPassword);
      const res = await api.post("/setting/passChange", { 
        currentPassword: values.currentPassword 
      });
      
      if (res.data.Status === "Success" || res.data.Message === "PassWord Change Otp Sent To Email") {
        setShowOTP(true);
        setIsInvalid(null);
      } else {
        setErrorMsg(res.data.Message || "Failed to initiate password change");
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.Message || "An error occurred");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPConfirm = async (code: string) => {
    setIsVerifying(true);
    try {
      const res = await api.post("/setting/validationChangepass", { 
        otp: code, 
        newPassword: newPasswordStore 
      });
      if (res.data.Status === "Success" || res.data.Message === "Password Change SuccessFul") {
        setShowOTP(false);
        setIsInvalid(null);
        setSuccessMsg("Password successfully changed!");
        formRef.current?.resetForm({ values: initialValues, errors: {}, touched: {} });
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setIsInvalid("Invalid OTP");
      }
    } catch (e) {
      setIsInvalid("Invalid OTP");
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReSentOtp = async () => {
    try {
     
      await api.post("/setting/resentOtpVarification"); 
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const inputClasses = "w-full bg-gray-50 px-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <>
      <PassConformationOtpModal
        isOpen={showOTP}
        onConfirm={handleOTPConfirm}
        onClose={() => setShowOTP(false)}
        isVerifying={isVerifying}
        isInvalid={isInvalid}
        reSentOtp={handleReSentOtp}
      />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
            <Lock size={13} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-gray-800">Security</h2>
            <p className="text-[11px] text-gray-400">Manage your password and security settings</p>
          </div>
        </div>

        <div className="p-6">
          {successMsg && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-3.5 mb-5 shadow-sm">
              <ShieldCheck size={16} className="text-green-500 shrink-0" />
              <p className="text-sm font-semibold text-green-800">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 mb-5 shadow-sm">
              <p className="text-sm font-semibold text-red-800">{errorMsg}</p>
            </div>
          )}

          <Formik 
            innerRef={formRef}
            initialValues={initialValues} 
            validationSchema={ChangePassValidation} 
            onSubmit={HandleChange}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={11} className="text-gray-400" />
                    Current Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      className={`${inputClasses} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.currentPassword && touched.currentPassword && (
                    <p className="mt-1 text-[10px] text-red-500">{String(errors.currentPassword)}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      New Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className={`${inputClasses} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.newPassword && touched.newPassword && (
                      <p className="mt-1 text-[10px] text-red-500">{String(errors.newPassword)}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Confirm New Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className={`${inputClasses} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-[10px] text-red-500">{String(errors.confirmPassword)}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
}

export default ChangePassForm;