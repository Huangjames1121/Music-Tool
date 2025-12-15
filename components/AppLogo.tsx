import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
          <stop offset="100%" stopColor="#a855f7" /> {/* Purple-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Bars (Bar Counter Metaphor) */}
      <rect x="20" y="45" width="10" height="35" rx="4" fill="#334155" className="animate-pulse" style={{ animationDelay: '0ms' }} />
      <rect x="35" y="35" width="10" height="45" rx="4" fill="#475569" className="animate-pulse" style={{ animationDelay: '100ms' }} />
      <rect x="50" y="25" width="10" height="55" rx="4" fill="#64748b" className="animate-pulse" style={{ animationDelay: '200ms' }} />
      <rect x="65" y="15" width="10" height="65" rx="4" fill="url(#logoGradient)" filter="url(#glow)" />

      {/* Metronome Needle / Play Triangle abstract */}
      <path 
        d="M25 85 L75 85 L50 15 L25 85 Z" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinejoin="round" 
        fill="none" 
        opacity="0.3"
      />
      
      {/* The "Smart" Sparkle */}
      <path 
        d="M85 15 L88 22 L95 25 L88 28 L85 35 L82 28 L75 25 L82 22 Z" 
        fill="#22d3ee" 
        filter="url(#glow)"
        className="animate-spin-slow origin-center"
      />
    </svg>
  );
};

export default AppLogo;