import React, { useRef, useState, useCallback } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
  isHovered: boolean;
}

export function useTilt(maxTilt = 7) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Normalized from -1 to 1
    const normX = (x / width) * 2 - 1;
    const normY = (y / height) * 2 - 1;

    const rotateX = -normY * maxTilt;
    const rotateY = normX * maxTilt;

    const glareX = (x / width) * 100;
    const glareY = (y / height) * 100;

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      isHovered: true,
    });
  }, [maxTilt]);

  const onMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  }, []);

  const cardStyle: React.CSSProperties = {
    transform: tilt.isHovered
      ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateZ(6px)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    transition: tilt.isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const glareStyle: React.CSSProperties = {
    background: tilt.isHovered
      ? `radial-gradient(circle 260px at ${tilt.glareX}% ${tilt.glareY}%, rgba(235, 125, 0, 0.15), rgba(235, 227, 167, 0.05) 40%, transparent 80%)`
      : 'none',
    opacity: tilt.isHovered ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  return { ref, tilt, onMouseMove, onMouseLeave, cardStyle, glareStyle };
}
