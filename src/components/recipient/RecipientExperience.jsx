import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keypad } from './Keypad';
import { EnvelopeLetter } from './EnvelopeLetter';
import { TeddyNav } from './TeddyNav';
import { MemoryGallery } from './MemoryGallery';
import { MusicPlayer } from './MusicPlayer';
import { SpecialMessageView } from './SpecialMessageView';
import { FinalSurpriseView } from './FinalSurpriseView';
import { ParticleBackground } from '../common/ParticleBackground';
import { GiftService } from '../../lib/supabaseClient';
import { getTheme } from '../../data/themes';

export const RecipientExperience = ({ slug, previewGift = null }) => {
  const [giftMetadata, setGiftMetadata] = useState(previewGift);
  const [unlockedGift, setUnlockedGift] = useState(previewGift && previewGift.unlocked ? previewGift : null);
  const [isLoading, setIsLoading] = useState(!previewGift);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('letter');

  // Load public gift metadata if not in direct preview mode
  useEffect(() => {
    if (previewGift) {
      setGiftMetadata(previewGift);
      if (previewGift.unlocked) {
        setUnlockedGift(previewGift);
      }
      setIsLoading(false);
      return;
    }

    async function fetchGiftMeta() {
      setIsLoading(true);
      setError('');
      try {
        const data = await GiftService.getGiftBySlug(slug);
        if (!data) {
          setError('This special surprise link could not be found or has not been published yet.');
        } else {
          setGiftMetadata(data);
        }
      } catch (err) {
        setError(err.message || 'Unable to load gift surprise.');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchGiftMeta();
    }
  }, [slug, previewGift]);

  // Handle password submission and unlocking
  const handleUnlock = async (enteredPassword) => {
    if (previewGift) {
      // In creator preview mode, allow direct unlock
      setUnlockedGift(previewGift);
      return;
    }

    const fullGift = await GiftService.verifyAndUnlockGift(slug, enteredPassword);
    if (!fullGift || fullGift.success === false) {
      throw new Error(fullGift?.message || 'Incorrect password. Please try again.');
    }
    setUnlockedGift(fullGift);
  };

  const handleReplayAll = () => {
    setActiveSection('letter');
  };

  const theme = getTheme(
    unlockedGift?.occasion || giftMetadata?.occasion,
    unlockedGift?.theme_id || giftMetadata?.theme_id
  );

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          🎁
        </motion.div>
        <p className="text-stone-600 font-medium font-rounded">Preparing your surprise...</p>
      </div>
    );
  }

  // 2. Error State (Not Found / Unreleased)
  if (error || !giftMetadata) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-rose-200 shadow-xl">
          <span className="text-4xl mb-4 block">💌</span>
          <h2 className="text-2xl font-bold text-stone-800 font-serif-classic mb-2">
            Surprise Not Available
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {error || 'This gift link may have been moved or unpublished by its creator.'}
          </p>
          <div className="text-xs text-rose-500 font-semibold">
            Little Moments – A Gift Made Just for You
          </div>
        </div>
      </div>
    );
  }

  // 3. Welcome Screen with Password Keypad (if not yet unlocked)
  if (!unlockedGift) {
    return (
      <Keypad
        gift={giftMetadata}
        onUnlock={handleUnlock}
        isLoading={isLoading}
        errorMessage={error}
      />
    );
  }

  // 4. UNLOCKED RECIPIENT SURPRISE EXPERIENCE
  // Exclusively displays the finished gift - zero creator links or editing tools!
  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br ${theme.bgGradient} transition-colors duration-700`}>
      {/* Floating Theme Particles */}
      <ParticleBackground count={24} themeParticles={theme.decorations || ['💖', '✨', '🌸']} />

      {/* Floating Background Music Player */}
      <MusicPlayer settings={unlockedGift.settings || {}} />

      {/* Recipient Experience Header */}
      <header className="relative z-10 pt-6 pb-2 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-xs text-xs font-semibold text-rose-600 mb-1">
          <span>✨ Made with love for {unlockedGift.recipient_name || 'you'} ♡</span>
        </div>
      </header>

      {/* Main Section Content Area */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-3 sm:px-6 py-4 pb-24 max-w-4xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'letter' && (
            <motion.div
              key="letter-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <EnvelopeLetter gift={unlockedGift} />
            </motion.div>
          )}

          {activeSection === 'memories' && (
            <motion.div
              key="memories-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <MemoryGallery photos={unlockedGift.photos || []} />
            </motion.div>
          )}

          {activeSection === 'music' && (
            <motion.div
              key="music-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center text-3xl mb-4">
                🎵
              </div>
              <h3 className="text-2xl font-bold font-serif-classic text-stone-800 mb-2">
                Melodies of the Heart
              </h3>
              <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
                Background music accompanies your gift experience. Use the floating disc on the top-right to adjust volume or pause anytime.
              </p>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 inline-block text-xs font-semibold text-purple-700">
                Track: {unlockedGift.settings?.music_title || 'Sweet Little Moments Melody'}
              </div>
            </motion.div>
          )}

          {activeSection === 'special' && (
            <motion.div
              key="special-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <SpecialMessageView gift={unlockedGift} />
            </motion.div>
          )}

          {activeSection === 'surprise' && (
            <motion.div
              key="surprise-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <FinalSurpriseView gift={unlockedGift} onReplayAll={handleReplayAll} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive 3D Teddy Bear Navigation Bar */}
      <TeddyNav
        activeSection={activeSection}
        onSelectSection={(sectionId) => setActiveSection(sectionId)}
      />
    </div>
  );
};
