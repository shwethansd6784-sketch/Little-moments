import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ChevronDown } from 'lucide-react';
import { getTheme } from '../../data/themes';

export const EnvelopeLetter = ({ gift, onLetterRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullyUnfolded, setIsFullyUnfolded] = useState(false);

  const theme = getTheme(gift?.occasion, gift?.theme_id);
  const content = gift?.letter_content || {};
  const settings = gift?.letter_settings || {};
  const fontClass = theme.fontClass || 'font-cursive';

  const handleOpenEnvelope = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        setIsFullyUnfolded(true);
        if (onLetterRead) onLetterRead();
      }, 1200);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4">
      {/* If not yet unfolded, show the 3D Envelope */}
      <AnimatePresence mode="wait">
        {!isFullyUnfolded ? (
          <motion.div
            key="envelope-container"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center w-full"
          >
            {/* Helpful prompt */}
            <motion.p
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-stone-700 font-semibold mb-4 text-center text-sm sm:text-base flex items-center gap-1.5"
            >
              <span>Tap the wax seal to unseal your letter</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.p>

            {/* 3D Envelope Wrapper */}
            <div
              onClick={handleOpenEnvelope}
              className="relative w-80 sm:w-96 h-56 sm:h-64 cursor-pointer perspective-1000 group select-none transition-transform hover:scale-102"
            >
              {/* Back / Body of Envelope */}
              <div className={`absolute inset-0 rounded-2xl ${theme.envelopeColor || 'bg-rose-300'} shadow-2xl border border-white/40 overflow-hidden`}>
                {/* Inner paper preview sliding up */}
                <motion.div
                  animate={isOpen ? { y: -80, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  className="absolute inset-x-4 top-2 h-48 bg-stone-50 rounded-t-xl border border-stone-200 shadow-md p-4 flex flex-col items-center text-center"
                >
                  <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold mb-1">
                    Personal Letter
                  </span>
                  <div className="w-16 h-0.5 bg-rose-300 rounded mb-2" />
                  <p className="text-xs text-stone-500 line-clamp-3 italic">
                    {content.greeting || 'Dearest...'}
                  </p>
                </motion.div>

                {/* Left and Right Envelope Folds */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                  }}
                />
                {/* Bottom Fold */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 100%, 50% 45%, 100% 100%)',
                    backgroundColor: 'rgba(0,0,0,0.12)',
                  }}
                />
              </div>

              {/* Envelope Flap with 3D Rotate */}
              <motion.div
                initial={false}
                animate={isOpen ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 30 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className={`absolute inset-x-0 top-0 h-32 ${theme.envelopeColor || 'bg-rose-300'} shadow-md`}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                  transformOrigin: 'top center',
                }}
              />

              {/* Wax Seal on Flap */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-rose-700 border-2 border-amber-300 shadow-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform"
                  >
                    <span>{theme.waxSeal || '💌'}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recipient Name Calligraphy on Front */}
              {!isOpen && (
                <div className="absolute bottom-5 inset-x-0 text-center z-20">
                  <span className="text-xs tracking-wider uppercase text-white/90 font-bold block">
                    For
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-white drop-shadow font-serif-classic">
                    {gift?.recipient_name || 'My Special Someone'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* FULLY UNFOLDED LETTER VIEW */
          <motion.div
            key="letter-unfolded"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`w-full ${theme.paperBg || 'bg-white/95'} rounded-3xl p-6 sm:p-10 shadow-2xl border backdrop-blur-md relative overflow-hidden`}
          >
            {/* Decorative Corner Ornaments */}
            <div className="absolute top-4 left-4 text-xl opacity-30 select-none">
              {theme.decorations?.[0] || '✨'}
            </div>
            <div className="absolute top-4 right-4 text-xl opacity-30 select-none">
              {theme.decorations?.[1] || '🌸'}
            </div>
            <div className="absolute bottom-4 left-4 text-xl opacity-30 select-none">
              {theme.decorations?.[2] || '💖'}
            </div>
            <div className="absolute bottom-4 right-4 text-xl opacity-30 select-none">
              {theme.decorations?.[3] || '✨'}
            </div>

            {/* Letter Header Stamp / Date */}
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{theme.waxSeal || '💌'}</span>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-stone-600 font-bold">
                    Little Moments Letter
                  </h3>
                  <span className="text-xs text-stone-600 font-serif-classic">
                    {new Date(gift?.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>Special Surprise</span>
              </div>
            </div>

            {/* Greeting */}
            {content.greeting && (
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-6 text-stone-800 ${fontClass}`}
                style={{ textAlign: settings.textAlign || 'left' }}
              >
                {content.greeting}
              </h2>
            )}

            {/* Main Letter Body */}
            <div
              className={`leading-relaxed whitespace-pre-wrap ${fontClass} ${theme.textColor || 'text-stone-800'}`}
              style={{
                fontSize: `${settings.fontSize || 20}px`,
                lineHeight: settings.lineHeight || 1.8,
                textAlign: settings.textAlign || 'left',
                color: settings.textColor || undefined,
              }}
            >
              {content.body || 'Thinking of you on this special day...'}
            </div>

            {/* Closing & Sender Name */}
            <div
              className={`mt-8 pt-6 border-t border-stone-200/50 ${fontClass}`}
              style={{ textAlign: settings.textAlign === 'center' ? 'center' : 'right' }}
            >
              {content.closing && (
                <p className="text-lg sm:text-xl text-stone-600 italic mb-1">
                  {content.closing}
                </p>
              )}
              {content.sender_name && (
                <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                  {content.sender_name}
                </p>
              )}
            </div>

            {/* Re-fold Button */}
            <div className="mt-8 pt-4 flex justify-center">
              <button
                onClick={() => setIsFullyUnfolded(false)}
                className="text-xs text-stone-600 hover:text-stone-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Fold back into envelope</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
