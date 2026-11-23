import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Delete, RotateCcw, AlertCircle, Heart, Sparkles } from 'lucide-react';
import { KeypadPointerTeddy } from '../common/TeddyCharacters';
import { ParticleBackground } from '../common/ParticleBackground';
import { getTheme } from '../../data/themes';

export const Keypad = ({ gift, onUnlock, isLoading = false, errorMessage = '' }) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAlphanumeric = gift?.password_type === 'alphanumeric';

  const theme = getTheme(gift?.occasion, gift?.theme_id);

  // Sync external error message
  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
      setIsError(true);
      const timer = setTimeout(() => setIsError(false), 800);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Support physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoading || isSubmitting) return;

      if (!isAlphanumeric) {
        if (/^[0-9*#]$/.test(e.key) && pin.length < 8) {
          setPin((prev) => prev + e.key);
          setLocalError('');
        } else if (e.key === 'Backspace') {
          setPin((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter' && pin.length > 0) {
          handleSubmit();
        } else if (e.key === 'Escape') {
          setPin('');
        }
      } else {
        if (e.key === 'Enter' && pin.length > 0) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isAlphanumeric, isLoading, isSubmitting]);

  const handleKeyPress = (char) => {
    if (pin.length < 8) {
      setPin((prev) => prev + char);
      setLocalError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin) {
      setLocalError('Please enter the password to open your surprise.');
      setIsError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await onUnlock(pin);
    } catch (err) {
      setLocalError(err.message || 'Incorrect password. Please try again.');
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setPin('');
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 12 Keypad buttons: 1-9, *, 0, #
  const keypadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '*', '0', '#'
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background with theme ambiance */}
      <div className={`fixed inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-90 transition-colors duration-700`} />
      <ParticleBackground count={20} themeParticles={theme.decorations || ['💖', '✨', '🌸']} />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-200/50"
      >
        {/* Adorable Animated Teddy Bear Pointing to Keypad */}
        <div className="flex flex-col items-center justify-center -mt-2 mb-3">
          <KeypadPointerTeddy isExcited={pin.length > 0} className="w-36 h-36 sm:w-44 sm:h-44" />

          {/* Exact Required Headlines */}
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold text-stone-800 text-center tracking-tight font-modern mt-1"
          >
            Hey, today is a special day!
          </motion.h1>

          <p className="text-sm sm:text-base text-rose-500 font-medium text-center mt-1 font-rounded">
            Some moments deserve more than just words.
          </p>

          <p className="text-xs sm:text-sm text-stone-600 text-center max-w-sm mt-1 leading-relaxed">
            Someone has prepared a little surprise for you. Open your heart and discover it!
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-semibold mt-3 shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>Made with love, just for you ♡</span>
          </div>
        </div>

        {/* Recipient Name Pill if provided */}
        {gift?.recipient_name && (
          <div className="text-center mb-4">
            <span className="text-xs uppercase tracking-widest text-stone-600 font-bold">
              Surprise Prepared For
            </span>
            <div className="text-lg font-bold text-stone-800 font-serif-classic">
              ✨ {gift.recipient_name} ✨
            </div>
          </div>
        )}

        {/* Password Dots Display or Text Field */}
        <div className="mb-5">
          {!isAlphanumeric ? (
            <motion.div
              animate={isError ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 shadow-inner"
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < pin.length;
                return (
                  <motion.div
                    key={idx}
                    animate={isFilled ? { scale: [0.8, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-rose-500 shadow-md shadow-rose-300 ring-2 ring-rose-300'
                        : 'bg-stone-200 border border-stone-300'
                    }`}
                  />
                );
              })}
              {pin.length > 4 && (
                <span className="text-xs text-rose-500 font-mono font-bold">+{pin.length - 4}</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              animate={isError ? { x: [-10, 10, -8, 8, 0] } : {}}
              className="relative"
            >
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setLocalError('');
                }}
                placeholder="Enter secret word or phrase..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-center font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white shadow-inner"
              />
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-center gap-1.5 text-xs text-red-500 font-medium text-center mt-2.5 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{localError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Numeric On-Screen Keypad for PINs */}
        {!isAlphanumeric && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-xs mx-auto mb-4">
            {keypadKeys.map((k) => (
              <motion.button
                key={k}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleKeyPress(k)}
                disabled={isLoading || isSubmitting}
                className="h-12 sm:h-14 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200/90 shadow-sm hover:shadow text-lg sm:text-xl font-bold text-stone-700 hover:text-rose-600 transition-all flex items-center justify-center select-none active:bg-rose-100"
              >
                {k}
              </motion.button>
            ))}
          </div>
        )}

        {/* Action Controls: Backspace, Clear, and Unlock */}
        <div className="flex items-center justify-between gap-3 max-w-xs mx-auto">
          {!isAlphanumeric && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={pin.length === 0 || isLoading || isSubmitting}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all flex items-center gap-1 disabled:opacity-40"
                title="Clear all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={pin.length === 0 || isLoading || isSubmitting}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all flex items-center gap-1 disabled:opacity-40"
                title="Delete last digit"
              >
                <Delete className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={pin.length === 0 || isLoading || isSubmitting}
            className={`flex-1 py-3 px-5 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              pin.length > 0
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-300 ring-2 ring-rose-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting || isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Surprise</span>
              </>
            )}
          </motion.button>
        </div>

        <p className="text-[11px] text-stone-600 text-center mt-4">
          Hint: You can also type directly using your physical keyboard.
        </p>
      </motion.div>
    </div>
  );
};
