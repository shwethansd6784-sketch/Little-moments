import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Heart, Gift } from 'lucide-react';
import { fireOccasionSurprise } from '../common/ConfettiEffect';
import { getTheme } from '../../data/themes';

export const FinalSurpriseView = ({ gift, onReplayAll }) => {
  const [isBoxOpened, setIsBoxOpened] = useState(false);
  const theme = getTheme(gift?.occasion, gift?.theme_id);
  const finalMsg = gift?.final_message || {};

  const handleOpenGiftBox = () => {
    setIsBoxOpened(true);
    fireOccasionSurprise(gift?.occasion);
  };

  // Automatically trigger confetti if already open
  useEffect(() => {
    if (isBoxOpened) {
      fireOccasionSurprise(gift?.occasion);
    }
  }, [isBoxOpened, gift?.occasion]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center justify-center text-center">
      <AnimatePresence mode="wait">
        {!isBoxOpened ? (
          /* CLOSED GIFT BOX READY TO BE TAPPED */
          <motion.div
            key="closed-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center cursor-pointer select-none group"
            onClick={handleOpenGiftBox}
          >
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-stone-700 font-bold text-lg mb-6 flex items-center gap-2"
            >
              <span>{finalMsg.surprise_box_label || 'Tap the Gift Box to Unwrap the Final Surprise!'}</span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            </motion.p>

            {/* 3D Interactive Animated Gift Box */}
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              whileTap={{ scale: 0.95 }}
              className="relative w-56 h-56 flex items-center justify-center"
            >
              {/* Soft ground shadow */}
              <div className="absolute bottom-2 w-48 h-10 bg-rose-950/20 rounded-full blur-md" />

              {/* Box Body */}
              <div className="relative w-44 h-40 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl shadow-2xl border-2 border-white/60 overflow-hidden flex items-center justify-center">
                {/* Vertical Ribbon */}
                <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 shadow-md" />
                {/* Horizontal Ribbon */}
                <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-400 shadow-md" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent animate-pulse" />
              </div>

              {/* Box Lid */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-2 w-48 h-12 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 rounded-xl shadow-lg border border-white/80 flex items-center justify-center z-10"
              >
                <div className="absolute inset-y-0 w-8 bg-amber-300 shadow-sm" />
                {/* Golden Bow Ribbon on Top */}
                <div className="absolute -top-7 flex items-center justify-center gap-1">
                  <div className="w-8 h-8 rounded-full border-4 border-amber-300 bg-amber-200/50 transform -rotate-45" />
                  <div className="w-8 h-8 rounded-full border-4 border-amber-300 bg-amber-200/50 transform rotate-45" />
                </div>
              </motion.div>
            </motion.div>

            <span className="mt-8 px-5 py-2.5 rounded-full bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-300 group-hover:bg-rose-600 transition-colors">
              🎁 Click to Open Surprise
            </span>
          </motion.div>
        ) : (
          /* UNWRAPPED SURPRISE REVEAL */
          <motion.div
            key="opened-surprise"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-full bg-white/95 backdrop-blur-xl border border-rose-200 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Celebration Emoticons Banner */}
            <div className="text-4xl mb-4 animate-bounce">
              {theme.decorations?.slice(0, 3).join(' ') || '🎉 ✨ 🎂'}
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-800 font-serif-classic leading-tight mb-4">
              {finalMsg.headline || 'A Lifetime of Happiness & Wonders!'}
            </h2>

            {/* Body */}
            <p className="text-base sm:text-lg text-stone-600 font-rounded leading-relaxed max-w-lg mx-auto mb-8">
              {finalMsg.body || 'May every single step ahead bring you closer to all your dreams. You are unconditionally loved and celebrated!'}
            </p>

            {/* Replay Confetti Button & Complete Replay Option */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => fireOccasionSurprise(gift?.occasion)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Shoot More Fireworks! ✨</span>
              </button>

              <button
                onClick={() => {
                  setIsBoxOpened(false);
                  if (onReplayAll) onReplayAll();
                }}
                className="px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Whole Gift Experience</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
