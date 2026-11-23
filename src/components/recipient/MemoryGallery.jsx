import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Heart, Image as ImageIcon } from 'lucide-react';

export const MemoryGallery = ({ photos = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);

  // If no photos uploaded yet, show placeholder message
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-rose-200 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-800 font-serif-classic mb-2">
          Memories in the Making
        </h3>
        <p className="text-sm text-stone-600 max-w-sm mx-auto">
          The creator has reserved this special scrapbook for shared memories. Every moment spent together is a treasure.
        </p>
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Scrapbook Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-500">
          Treasured Moments
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 font-serif-classic mt-1">
          Scrapbook of Memories
        </h2>
        <div className="w-12 h-1 bg-rose-400 rounded-full mx-auto mt-2" />
      </div>

      {/* Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {photos.map((photo, index) => {
          // Slight alternating tilt for authentic scrapbook feel
          const rotation = index % 3 === 0 ? -2.5 : index % 3 === 1 ? 2 : -1;

          return (
            <motion.div
              key={photo.id || index}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedIdx(index)}
              style={{ rotate: `${rotation}deg` }}
              className="bg-white p-3.5 pb-5 rounded-2xl shadow-xl hover:shadow-2xl border border-stone-200/80 cursor-pointer transition-shadow group relative"
            >
              {/* Cute Washi Tape Effect at the Top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-rose-200/80 backdrop-blur-xs border-y border-dashed border-rose-300 transform -rotate-1 rounded-sm shadow-xs select-none" />

              {/* Photo Image */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/50">
                <img
                  src={photo.url || photo.storage_path}
                  alt={photo.caption || `Memory ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Polaroid Caption */}
              <div className="mt-3 text-center px-1">
                <p className="font-handwriting text-lg sm:text-xl text-stone-700 leading-tight">
                  {photo.caption || `Captured with love ♡`}
                </p>
              </div>

              {/* Tiny heart sticker */}
              <div className="absolute bottom-2 right-2 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enlarged Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous button */}
            {photos.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next button */}
            {photos.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Main Lightbox Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200"
            >
              <div className="relative max-h-[65vh] w-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center">
                <img
                  src={photos[selectedIdx]?.url || photos[selectedIdx]?.storage_path}
                  alt={photos[selectedIdx]?.caption || 'Enlarged Memory'}
                  className="max-h-[65vh] max-w-full object-contain"
                />
              </div>

              {/* Caption & Counter */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
                <p className="font-handwriting text-2xl text-stone-800 text-center sm:text-left">
                  {photos[selectedIdx]?.caption || 'Sweet Memory ♡'}
                </p>
                <span className="text-xs text-stone-600 font-bold bg-stone-100 px-3 py-1 rounded-full">
                  {selectedIdx + 1} of {photos.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
