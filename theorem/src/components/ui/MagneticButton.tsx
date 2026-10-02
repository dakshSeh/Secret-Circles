'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import Link from 'next/link';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  asLink?: boolean;
  href?: string;
}

export default function MagneticButton({ children, className, asLink, href, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 }); 
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      style={{ display: 'inline-flex' }}
    >
      {children}
    </motion.div>
  );

  if (asLink && href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
        {inner}
      </Link>
    );
  }

  return (
    <button {...props} style={{ display: 'inline-block', border: 'none', background: 'none', padding: 0 }}>
      {inner}
    </button>
  );
}
