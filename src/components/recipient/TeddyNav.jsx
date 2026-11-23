import React from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeTeddy,
  CameraTeddy,
  MusicTeddy,
  HeartTeddy,
  GiftTeddy,
} from '../common/TeddyCharacters';

export const TeddyNav = ({ activeSection, onSelectSection }) => {
  const navItems = [
    {
      id: 'letter',
      label: 'Letter',
      subtitle: 'Personal Note',
      Component: EnvelopeTeddy,
      color: 'from-pink-400 to-rose-400',
    },
    {
      id: 'memories',
      label: 'Memories',
      subtitle: 'Photo Gallery',
      Component: CameraTeddy,
      color: 'from-sky-400 to-blue-400',
    },
    {
      id: 'music',
      label: 'Music',
      subtitle: 'Melodies',
      Component: MusicTeddy,
      color: 'from-purple-400 to-indigo-400',
    },
    {
      id: 'special',
      label: 'Heart Note',
      subtitle: 'Special Words',
      Component: HeartTeddy,
      color: 'from-red-400 to-rose-500',
    },
    {
      id: 'surprise',
      label: 'Surprise',
      subtitle: 'Final Gift',
      Component: GiftTeddy,
      color: 'from-amber-400 to-orange-400',
    },
  ];

  return (
    <nav
      aria-label="Teddy Bear Surprise Navigation"
      className="sticky bottom-4 z-40 w-full max-w-xl mx-auto px-3"
    >
      <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-rose-200/50 flex items-center justify-between gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const { Component } = item;

          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-rose-50 border border-rose-200 shadow-sm'
                  : 'hover:bg-stone-50/80 border border-transparent'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute -top-1 w-6 h-1 rounded-full bg-rose-500 shadow-sm shadow-rose-300"
                />
              )}

              {/* Teddy Character Avatar */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <Component active={isActive} className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-xs font-bold tracking-tight mt-0.5 transition-colors line-clamp-1 ${
                  isActive ? 'text-rose-600' : 'text-stone-600'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
