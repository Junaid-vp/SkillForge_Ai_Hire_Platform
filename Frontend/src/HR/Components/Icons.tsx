
/**
 * SkillForge AI - High Fidelity Hex Bolt Icon
 * Matches the production brand asset precisely.
 */
export const HexBolt = ({ size = 32, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon 
      points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" 
      fill="#0d1528" 
      stroke="#2563eb" 
      strokeWidth="1.2" 
      transform="translate(16,16) scale(0.8)"
    />
    <path 
      d="M3,-11 L-4,0 L1,0 L-5,11 L5,-2 L0,-2 Z" 
      fill="white" 
      transform="translate(16,16) scale(0.8)"
    />
  </svg>
);

/**
 * SkillForge AI - Standard Bolt Icon
 * Simplified version of the brand mark for UI usage.
 */
export const Bolt = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M13,3 L5,14 L11,14 L8,21 L16,10 L10,10 Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * SkillForge AI - Horizontal Wordmark Logo
 * Exactly as seen on the RollSelection page.
 */
export const Logo = ({ 
  className = "", 
  size = 32,
  textSize = "text-base",
  subTextSize = "text-[9px]",
  onClick 
}: { 
  className?: string, 
  size?: number,
  textSize?: string,
  subTextSize?: string,
  onClick?: () => void 
}) => (
  <div className={`flex items-center gap-2.5 ${className}`} onClick={onClick}>
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <HexBolt size={size} className="w-full h-full" />
    </div>
    <div className="flex flex-col leading-tight text-left">
      <span className={`font-bold tracking-tight text-gray-900 uppercase ${textSize}`}>SKILLFORGE</span>
      <span className={`font-bold tracking-[0.3em] text-blue-600 uppercase ${subTextSize}`}>AI PLATFORM</span>
    </div>
  </div>
);

/**
 * SkillForge AI - Gemini Star Icon
 */
export const GeminiStar = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" />
  </svg>
);
