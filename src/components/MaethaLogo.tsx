import { SVGProps } from 'react';

interface MaethaLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function MaethaLogo({ size = 70, className, ...props }: MaethaLogoProps) {
  return (
    <svg 
      viewBox="0 0 160 135" 
      width={size} 
      height={(size * 135) / 160} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Blue Background Letter "MT" */}
      <text 
        x="44" 
        y="54" 
        fill="#1E3A8A" 
        style={{ 
          fontSize: '52px', 
          fontWeight: 900, 
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          letterSpacing: '-2px'
        }}
      >
        MT
      </text>

      {/* Red Cross Overlap */}
      {/* Horizontal Bar */}
      <rect x="8" y="27" width="52" height="18" fill="#E21E26" rx="1" />
      {/* Vertical Bar */}
      <rect x="25" y="10" width="18" height="52" fill="#E21E26" rx="1" />

      {/* Thai Typography: โรงพยาบาลแม่ทา */}
      <text 
        x="80" 
        y="90" 
        fill="#1E3A8A" 
        textAnchor="middle"
        style={{ 
          fontSize: '15.5px', 
          fontWeight: 'bold', 
          fontFamily: "'Sarabun', 'Kanit', sans-serif" 
        }}
      >
        โรงพยาบาลแม่ทา
      </text>

      {/* Red Heartbeat ECG Line on Left/Center */}
      <path 
        d="M 12 114 L 30 114 L 34 108 L 38 122 L 44 98 L 49 119 L 53 114 L 62 114" 
        stroke="#E21E26" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* English Typography: MAETHA HOSPITAL */}
      <text 
        x="108" 
        y="117" 
        fill="#1E3A8A" 
        textAnchor="middle"
        style={{ 
          fontSize: '11px', 
          fontWeight: 900, 
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.2px' 
        }}
      >
        MAETHA HOSPITAL
      </text>
    </svg>
  );
}
