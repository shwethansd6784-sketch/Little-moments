import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Quote } from 'lucide-react';
import { getTheme } from '../../data/themes';

export const SpecialMessageView = ({ gift }) => {
  const specialMessage = gift?.special_message || {};
  const theme = getTheme(gift?.occasion, gift?.theme_id);

  const quote = specialMessage.quote || 'You are more special than words could ever capture.';
  const note = specialMessage.note || 'Always remember how loved, appreciated, and cherished you are. ♡';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full bg-white/90 backdrop-blur-xl border border-rose-200 rounded-3xl p-6 sm:p-10 shadow-2xl text-center overflow-hidden"
      >
        {/* Soft decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Floating Heart Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center mb-6 shadow-sm">
          <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <span className="text-xs uppercase tracking-widest text-rose-500 font-bold block mb-2">
          From the Depths of My Heart
        </span>

        {/* Quote Marker */}
        <Quote className="w-8 h-8 text-rose-300 mx-auto mb-3 opacity-60" />

        {/* Main Meaningful Quote */}
        <h2 className="text-2xl sm:text-3xl font-serif-classic text-stone-800 leading-snug mb-6 italic px-2 sm:px-6">
          "{quote}"
        </h2>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-0.5 bg-rose-200 rounded" />
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div className="w-12 h-0.5 bg-rose-200 rounded" />
        </div>

        {/* Personal Note */}
        {note && (
          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto shadow-inner">
            <p className="font-handwriting text-xl sm:text-2xl text-stone-700 leading-relaxed">
              {note}
            </p>
          </div>
        )}

        {/* Signature stamp */}
        <div className="mt-8 text-xs text-stone-600 font-medium">
          Sent with endless love & affection ♡
        </div>
      </motion.div>
    </div>
  );
};
