import React from 'react';

interface TheoremLogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TheoremLogo({ size = 16, color = 'currentColor', className, style }: TheoremLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path d="M 4 4 H 10 L 18 20 H 22" />
      <path d="M 2 20 H 8 L 14 8" />
    </svg>
  );
}
