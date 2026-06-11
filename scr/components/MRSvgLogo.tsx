import React from "react";

interface MRSvgLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const MRSvgLogo: React.FC<MRSvgLogoProps> = ({
  className = "",
  size = 64,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md transition-transform hover:scale-105"
        id="mr-logo-svg"
      >
        <defs>
          {/* Metallic Editorial Gold Gradient replicating premium jewelry gold */}
          <linearGradient id="bronzeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3E3015" />
            <stop offset="25%" stopColor="#8A6B29" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#AA8432" />
            <stop offset="100%" stopColor="#261C0B" />
          </linearGradient>

          {/* Lighter highlight gradient for overlay accents in champagne */}
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E7" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6B29" />
          </linearGradient>

          {/* Core shadows for 3D realism */}
          <filter id="mr-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        <g id="towers-group" filter="url(#mr-shadow)">
          {/* Center Main Building (Tallest) */}
          <path
            d="M107 24 L120 12 L133 24 L133 130 L107 130 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.8"
          />
          {/* Window Slits/Cutouts on Center Tower */}
          <path d="M112 40 L118 35 L118 42 L112 47 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M112 55 L118 50 L118 57 L112 62 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M112 70 L118 65 L118 72 L112 77 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M112 85 L118 80 L118 87 L112 92 Z" fill="#ffffff" fillOpacity="0.3" />

          <path d="M128 40 L122 35 L122 42 L128 47 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M128 55 L122 50 L122 57 L128 62 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M128 70 L122 65 L122 72 L128 77 Z" fill="#ffffff" fillOpacity="0.3" />
          <path d="M128 85 L122 80 L122 87 L128 92 Z" fill="#ffffff" fillOpacity="0.3" />

          {/* Left Inner Building */}
          <path
            d="M87 40 L101 26 L101 130 L87 130 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.8"
          />
          {/* Left Tower Window Cutouts */}
          <path d="M91 55 L96 50 L96 56 L91 61 Z" fill="#ffffff" fillOpacity="0.25" />
          <path d="M91 70 L96 65 L96 71 L91 76 Z" fill="#ffffff" fillOpacity="0.25" />
          <path d="M91 85 L96 80 L96 86 L91 91 Z" fill="#ffffff" fillOpacity="0.25" />

          {/* Right Inner Building */}
          <path
            d="M139 26 L153 40 L153 130 L139 130 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.8"
          />
          {/* Right Tower Window Cutouts */}
          <path d="M149 55 L144 50 L144 56 L149 61 Z" fill="#ffffff" fillOpacity="0.25" />
          <path d="M149 70 L144 65 L144 71 L149 76 Z" fill="#ffffff" fillOpacity="0.25" />
          <path d="M149 85 L144 80 L144 86 L149 91 Z" fill="#ffffff" fillOpacity="0.25" />

          {/* Left Outer Building (Shortest Tier) */}
          <path
            d="M71 74 L81 64 L81 130 L71 130 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.8"
          />

          {/* Right Outer Building (Shortest Tier) */}
          <path
            d="M159 64 L169 74 L169 130 L159 130 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.8"
          />

          {/* Left Curved Frame Arch */}
          <path
            d="M62 108 C62 80 68 83 68 83 L68 126 C68 126 62 118 62 108 Z"
            fill="url(#bronzeGradient)"
          />

          {/* Right Curved Frame Arch */}
          <path
            d="M178 108 C178 80 172 83 172 83 L172 126 C172 126 178 118 178 108 Z"
            fill="url(#bronzeGradient)"
          />

          {/* Beautiful Curved Crescent swoosh ring wrapping the base */}
          <path
            d="M38 118 C38 184 202 184 202 118 C202 118 206 148 190 166 C172 186 68 186 50 166 C34 148 38 118 38 118 Z"
            fill="url(#bronzeGradient)"
            stroke="url(#highlightGradient)"
            strokeWidth="0.5"
          />

          {/* MR Text Plate - Extruded and integrated with the base in bronze */}
          <g transform="translate(0, 5)">
            {/* 3D background behind MR text */}
            <path
              d="M78 120 L162 120 L158 152 L82 152 Z"
              fill="#2E1C0F"
              opacity="0.8"
            />
            {/* Golden Frame for Text Plate */}
            <path
              d="M78 120 L162 120 L158 152 L82 152 Z"
              stroke="url(#highlightGradient)"
              strokeWidth="2"
              fill="none"
            />
            {/* Text "MR" explicitly drawn with path curves for precise rendering */}
            <text
              x="120"
              y="145"
              fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
              fontSize="30"
              fontWeight="900"
              fill="url(#highlightGradient)"
              textAnchor="middle"
              letterSpacing="2"
              id="mr-letters"
            >
              MR
            </text>
          </g>
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col select-none leading-none">
          <span className="font-sans text-xl font-bold tracking-widest text-[#D4AF37]">
            MR
          </span>
          <span className="font-sans text-[8px] font-semibold tracking-[0.1rem] text-[#F5F5F0]/60 uppercase">
            Assessoria e Projetos
          </span>
        </div>
      )}
    </div>
  );
};
