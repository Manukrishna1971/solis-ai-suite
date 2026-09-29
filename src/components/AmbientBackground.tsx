import React, { useEffect, useState } from 'react';

export const AmbientBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep dark brown base layer */}
      <div className="absolute inset-0 bg-[#161408]" />

      {/* Brunswick green and Dark brown luxury gradient mesh */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% -15%, rgba(44, 87, 69, 0.45), transparent 75%),
            radial-gradient(ellipse 70% 50% at 85% 65%, rgba(46, 41, 16, 0.85), transparent 70%),
            radial-gradient(ellipse 60% 60% at 15% 85%, rgba(44, 87, 69, 0.35), transparent 70%),
            linear-gradient(180deg, #161408 0%, #1A170A 40%, #110F05 100%)
          `
        }}
      />

      {/* Interactive Cursor Spotlight following mouse */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(235, 125, 0, 0.12) 0%, rgba(44, 87, 69, 0.18) 35%, transparent 70%)`
        }}
      />

      {/* Floating subtle cosmic orbs */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-brunswick/25 rounded-full blur-[110px] animate-float-slow pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[480px] h-[480px] bg-tangerine/10 rounded-full blur-[140px] animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] bg-darkbrown/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Fine architectural grid mesh */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #EBE3A7 1px, transparent 1px),
            linear-gradient(to bottom, #EBE3A7 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Fine luxury tactile noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
};
