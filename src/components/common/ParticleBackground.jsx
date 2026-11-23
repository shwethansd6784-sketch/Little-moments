import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const ParticleBackground = ({ count = 28, themeParticles = ['💖', '✨', '⭐', '🌸', '💫'] }) => {
  // Generate deterministic particles to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i * 27) % 96 + 2, // percentage across width
      y: (i * 33) % 96 + 2, // percentage across height
      size: 14 + (i % 5) * 4,
      symbol: themeParticles[i % themeParticles.length],
      duration: 10 + (i % 6) * 3,
      delay: (i % 5) * 1.4,
      floatY: 20 + (i % 4) * 12,
      rotateDeg: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15),
    }));
  }, [count, themeParticles]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft radial ambient glow discs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200/35 rounded-full blur-3xl animate-float-slow" />

      {/* Floating Sparkles & Hearts */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none opacity-40 hover:opacity-80 transition-opacity"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
          }}
          animate={{
            y: [0, -p.floatY, 0],
            x: [0, (p.id % 2 === 0 ? 10 : -10), 0],
            rotate: [0, p.rotateDeg, 0],
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {p.symbol}
        </motion.div>
      ))}
    </div>
  );
};
