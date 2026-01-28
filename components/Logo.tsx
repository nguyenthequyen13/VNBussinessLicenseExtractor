import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
    </defs>
    <rect x="96" y="64" width="320" height="384" rx="32" fill="white" stroke="#e2e8f0" strokeWidth="24" />
    <rect x="160" y="144" width="192" height="24" rx="8" fill="#cbd5e1" />
    <rect x="160" y="208" width="192" height="24" rx="8" fill="#cbd5e1" />
    <rect x="160" y="272" width="128" height="24" rx="8" fill="#cbd5e1" />
    
    <circle cx="336" cy="336" r="80" fill="url(#logo_grad)" stroke="white" strokeWidth="12" />
    <path d="M392 392L432 432" stroke="#1e40af" strokeWidth="32" strokeLinecap="round" />
  </svg>
);

export default Logo;