import { useState, useRef, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";

interface OTPModalProps {
  isOpen: boolean;
  onConfirm: (code: string) => void;
  onClose: () => void;
  isVerifying: boolean;
  isInvalid: null | string;
  reSentOtp: () => void;
}

const OTP_LENGTH = 6;

function DevOtpModal({ isOpen, onConfirm, onClose, isVerifying, isInvalid, reSentOtp }: OTPModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && otp.every(d => d !== "") && !isVerifying) {
      onConfirm(code);
    }
  }, [otp, onConfirm, isVerifying]);

  useEffect(() => {
    if (isOpen) {
      setTimer(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer === 0) return;
    const interval = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isOpen]);

  const handleResend = () => {
    if (timer !== 0) return;
    reSentOtp();
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
  };

  if (!isOpen) return null;

  const filled = otp.filter(d => d !== "").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 font-sans antialiased">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-200/60 overflow-hidden">

        {/* Progress bar */}
        <div className="h-[3px] bg-gray-100">
          <div
            className={`h-full transition-all duration-500 ease-out ${isInvalid ? 'bg-red-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
            style={{ width: `${(filled / OTP_LENGTH) * 100}%` }}
          />
        </div>

        <div className="px-8 pt-7 pb-8">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-300 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-[21px] font-bold tracking-tight text-gray-900 mb-1.5">
              Check your email
            </h2>
            <p className="text-[13.5px] text-gray-400 leading-6 font-normal tracking-normal">
              We sent a 6‑digit verification code<br />to your email address.
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 mb-5">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`w-11 text-center rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2
                  ${isInvalid
                    ? 'border-red-300 bg-red-50 text-red-500 focus:ring-red-200 focus:border-red-400'
                    : digit
                    ? 'border-blue-400 bg-blue-50 text-blue-600 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white'
                  }`}
                style={{
                  height: '52px',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.05em',
                }}
                placeholder="·"
              />
            ))}
          </div>

          {/* Error */}
          {isInvalid && (
            <div className="flex items-center justify-center bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-5">
              <p className="text-[11px] text-red-500 font-semibold">{isInvalid}</p>
            </div>
          )}

          {/* Verifying */}
          {isVerifying && (
            <div className="flex justify-center items-center gap-2 mb-5">
              <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-widest">Verifying</p>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-5" />

          {/* Resend */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-gray-400">Didn't receive a code?</p>
            {timer > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                <span className="text-[12px] font-bold text-gray-500 tabular-nums">
                  {String(timer).padStart(2, '0')}s
                </span>
              </div>
            ) : (
              <button
                onClick={handleResend}
                className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RotateCcw size={11} />
                Resend code
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default DevOtpModal;