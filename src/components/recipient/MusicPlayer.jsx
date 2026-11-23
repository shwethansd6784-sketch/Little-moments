import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, Disc3 } from 'lucide-react';
import { audioPlayer, PRESET_TRACKS } from '../../lib/audioPresets';

export const MusicPlayer = ({ settings = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);

  const isEnabled = settings.music_enabled !== false;
  const trackId = settings.music_track || 'sweet_music_box';
  const customAudioUrl = settings.custom_audio_url || null;

  // Track title lookup
  const currentTrack = PRESET_TRACKS.find((t) => t.id === trackId) || {
    title: settings.music_title || 'Sweet Little Melody',
    artist: 'Little Moments',
  };

  const handleTogglePlay = () => {
    if (customAudioUrl) {
      // Custom HTML5 Audio element handler
      const audioEl = document.getElementById('lm-custom-audio');
      if (audioEl) {
        if (isPlaying) {
          audioEl.pause();
          setIsPlaying(false);
        } else {
          audioEl.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    } else {
      // Procedural Web Audio Engine
      audioPlayer.currentTrackId = trackId;
      const state = audioPlayer.toggle();
      setIsPlaying(state);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioPlayer.setVolume(val);
    const audioEl = document.getElementById('lm-custom-audio');
    if (audioEl) audioEl.volume = val;
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioPlayer.setVolume(volume || 0.5);
      const audioEl = document.getElementById('lm-custom-audio');
      if (audioEl) audioEl.volume = volume || 0.5;
    } else {
      setIsMuted(true);
      audioPlayer.setVolume(0);
      const audioEl = document.getElementById('lm-custom-audio');
      if (audioEl) audioEl.volume = 0;
    }
  };

  // Stop music on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stopTrack();
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      {customAudioUrl && (
        <audio id="lm-custom-audio" src={customAudioUrl} loop preload="auto" />
      )}

      {/* Floating Audio Controller */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative flex items-center gap-2">
          {/* Expanded Controls Card */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl p-3 shadow-xl flex items-center gap-3"
              >
                {/* Track Info */}
                <div className="flex flex-col text-left pr-2 border-r border-stone-200">
                  <span className="text-xs font-bold text-stone-800 line-clamp-1 max-w-[130px]">
                    {currentTrack.title}
                  </span>
                  <span className="text-[10px] text-stone-600">
                    {isPlaying ? 'Now Playing ♪' : 'Paused'}
                  </span>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleMute}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-stone-600" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-rose-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Disc Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleTogglePlay}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsExpanded((prev) => !prev);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 ${
              isPlaying
                ? 'bg-rose-500 border-white text-white shadow-rose-300 ring-4 ring-rose-200/50'
                : 'bg-white/90 border-rose-200 text-rose-500 hover:bg-rose-50'
            }`}
            title={isPlaying ? 'Pause Music' : 'Play Background Melody'}
          >
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Disc3 className="w-6 h-6" />
            </motion.div>
          </motion.button>

          {/* Toggle Expand Pill */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-6 h-6 rounded-full bg-white/80 border border-stone-200 text-stone-500 hover:text-stone-800 text-xs flex items-center justify-center shadow-xs"
            title="Music Settings"
          >
            ⚙
          </button>
        </div>
      </div>
    </>
  );
};
