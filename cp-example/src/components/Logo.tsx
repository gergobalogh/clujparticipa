import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <div className={`flex items-baseline gap-4 ${className}`}>
      <div 
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        className="flex items-center justify-center bg-black text-white rounded-full font-serif font-bold italic tracking-tighter shrink-0"
      >
        CP
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif font-black tracking-tight leading-none uppercase text-ink">
          ClujParticipa
        </h1>
        <p className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase opacity-50 mt-1 text-ink">
          Vocea orașului tău • Civic Platform
        </p>
      </div>
    </div>
  );
};

export default Logo;
