import React from 'react';
import { motion } from 'framer-motion';

/**
 * Common 3D plush gradients for cute teddy bears
 */
const TeddyDefs = () => (
  <defs>
    {/* Body Fur Gradient */}
    <radialGradient id="furGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#f5c796" />
      <stop offset="50%" stopColor="#d99b66" />
      <stop offset="100%" stopColor="#b4733e" />
    </radialGradient>
    {/* Snout & Belly Gradient */}
    <radialGradient id="snoutGrad" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#fff2dc" />
      <stop offset="70%" stopColor="#f3d7b4" />
      <stop offset="100%" stopColor="#deba8e" />
    </radialGradient>
    {/* Inner Ear Gradient */}
    <radialGradient id="earGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#ffb8b8" />
      <stop offset="100%" stopColor="#e67e85" />
    </radialGradient>
    {/* Cheek Blush */}
    <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="rgba(255, 120, 140, 0.65)" />
      <stop offset="100%" stopColor="rgba(255, 120, 140, 0)" />
    </radialGradient>
    {/* Eye Sparkle */}
    <radialGradient id="eyeGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#4a3225" />
      <stop offset="60%" stopColor="#24140b" />
      <stop offset="100%" stopColor="#0a0503" />
    </radialGradient>
    {/* Soft Shadow */}
    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="rgba(70, 30, 10, 0.28)" />
      <stop offset="100%" stopColor="rgba(70, 30, 10, 0)" />
    </radialGradient>
  </defs>
);

/**
 * 1. Teddy Pointing to Password Keypad (Welcome Screen)
 */
export const KeypadPointerTeddy = ({ className = 'w-48 h-48', isExcited = false }) => {
  return (
    <motion.svg
      viewBox="0 0 200 220"
      className={`${className} drop-shadow-xl select-none`}
      animate={
        isExcited
          ? { y: [0, -12, 0, -8, 0], rotate: [0, -4, 4, -2, 0] }
          : { y: [0, -6, 0], rotate: [-1, 1, -1] }
      }
      transition={{ duration: isExcited ? 0.8 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      {/* Ground Shadow */}
      <ellipse cx="100" cy="205" rx="55" ry="10" fill="url(#shadowGrad)" />

      {/* Feet */}
      <circle cx="68" cy="190" r="18" fill="url(#furGrad)" />
      <circle cx="68" cy="190" r="11" fill="url(#snoutGrad)" />
      <circle cx="132" cy="190" r="18" fill="url(#furGrad)" />
      <circle cx="132" cy="190" r="11" fill="url(#snoutGrad)" />

      {/* Body */}
      <ellipse cx="100" cy="148" rx="42" ry="46" fill="url(#furGrad)" />
      {/* Belly Patch with tiny heart */}
      <ellipse cx="100" cy="152" rx="26" ry="30" fill="url(#snoutGrad)" />
      <path d="M100 148 C97 142 88 144 88 152 C88 160 100 167 100 167 C100 167 112 160 112 152 C112 144 103 142 100 148 Z" fill="#f43f5e" opacity="0.8" />

      {/* Left Resting Arm */}
      <ellipse cx="58" cy="142" rx="14" ry="24" transform="rotate(20 58 142)" fill="url(#furGrad)" />

      {/* Ears */}
      <circle cx="65" cy="55" r="20" fill="url(#furGrad)" />
      <circle cx="65" cy="55" r="12" fill="url(#earGrad)" />
      <circle cx="135" cy="55" r="20" fill="url(#furGrad)" />
      <circle cx="135" cy="55" r="12" fill="url(#earGrad)" />

      {/* Head */}
      <circle cx="100" cy="85" r="46" fill="url(#furGrad)" />

      {/* Cheeks */}
      <circle cx="74" cy="98" r="13" fill="url(#blushGrad)" />
      <circle cx="126" cy="98" r="13" fill="url(#blushGrad)" />

      {/* Snout */}
      <ellipse cx="100" cy="96" rx="20" ry="16" fill="url(#snoutGrad)" />
      {/* Nose */}
      <polygon points="94,90 106,90 100,98" fill="#4a2e1b" rx="2" />
      {/* Smile */}
      <path d="M100 98 L100 104 M94 103 Q100 108 106 103" stroke="#4a2e1b" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Cute Eyes */}
      <ellipse cx="80" cy="80" rx="6.5" ry="7.5" fill="url(#eyeGrad)" />
      <circle cx="78" cy="78" r="2.2" fill="#ffffff" />
      <circle cx="82" cy="83" r="1" fill="#ffffff" />

      <ellipse cx="120" cy="80" rx="6.5" ry="7.5" fill="url(#eyeGrad)" />
      <circle cx="118" cy="78" r="2.2" fill="#ffffff" />
      <circle cx="122" cy="83" r="1" fill="#ffffff" />

      {/* Right Arm POINTING towards keypad! */}
      <motion.g
        animate={{ rotate: [-4, 6, -4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '135px', originY: '135px' }}
      >
        <path d="M135 135 Q165 125 185 110" stroke="url(#furGrad)" strokeWidth="24" strokeLinecap="round" fill="none" />
        {/* Pointing Hand with Index Paw & Sparkles */}
        <circle cx="186" cy="108" r="12" fill="url(#snoutGrad)" />
        <path d="M185 106 L198 98" stroke="#d99b66" strokeWidth="8" strokeLinecap="round" />
        {/* Sparkles around pointer */}
        <text x="188" y="90" fontSize="16" className="select-none animate-pulse">✨</text>
      </motion.g>
    </motion.svg>
  );
};

/**
 * 2. Teddy Holding Envelope (Letter Section)
 */
export const EnvelopeTeddy = ({ className = 'w-16 h-16', active = false }) => {
  return (
    <motion.svg
      viewBox="0 0 160 170"
      className={`${className} drop-shadow-md`}
      animate={active ? { scale: [1, 1.08, 1], y: [0, -5, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      <ellipse cx="80" cy="160" rx="42" ry="7" fill="url(#shadowGrad)" />
      {/* Ears */}
      <circle cx="50" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="50" cy="45" r="9" fill="url(#earGrad)" />
      <circle cx="110" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="110" cy="45" r="9" fill="url(#earGrad)" />
      {/* Body */}
      <ellipse cx="80" cy="118" rx="34" ry="38" fill="url(#furGrad)" />
      {/* Head */}
      <circle cx="80" cy="70" r="36" fill="url(#furGrad)" />
      <circle cx="60" cy="80" r="10" fill="url(#blushGrad)" />
      <circle cx="100" cy="80" r="10" fill="url(#blushGrad)" />
      <ellipse cx="80" cy="78" rx="16" ry="12" fill="url(#snoutGrad)" />
      <polygon points="75,74 85,74 80,80" fill="#4a2e1b" />
      <path d="M80 80 L80 84 M76 84 Q80 88 84 84" stroke="#4a2e1b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="66" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="64" cy="63" r="1.8" fill="#fff" />
      <ellipse cx="94" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="92" cy="63" r="1.8" fill="#fff" />
      {/* HELD ENVELOPE */}
      <g transform="translate(52, 105)">
        <rect x="0" y="0" width="56" height="38" rx="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <path d="M0 0 L28 20 L56 0" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.8" />
        <circle cx="28" cy="19" r="6" fill="#e11d48" />
        <text x="25" y="22" fontSize="7" fill="#fff">💌</text>
      </g>
      {/* Paws holding envelope */}
      <circle cx="54" cy="122" r="9" fill="url(#snoutGrad)" />
      <circle cx="106" cy="122" r="9" fill="url(#snoutGrad)" />
    </motion.svg>
  );
};

/**
 * 3. Teddy Holding Camera (Memories / Photos Section)
 */
export const CameraTeddy = ({ className = 'w-16 h-16', active = false }) => {
  return (
    <motion.svg
      viewBox="0 0 160 170"
      className={`${className} drop-shadow-md`}
      animate={active ? { scale: [1, 1.08, 1], y: [0, -5, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      <ellipse cx="80" cy="160" rx="42" ry="7" fill="url(#shadowGrad)" />
      {/* Ears */}
      <circle cx="50" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="50" cy="45" r="9" fill="url(#earGrad)" />
      <circle cx="110" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="110" cy="45" r="9" fill="url(#earGrad)" />
      {/* Body & Head */}
      <ellipse cx="80" cy="118" rx="34" ry="38" fill="url(#furGrad)" />
      <circle cx="80" cy="70" r="36" fill="url(#furGrad)" />
      <circle cx="60" cy="80" r="10" fill="url(#blushGrad)" />
      <circle cx="100" cy="80" r="10" fill="url(#blushGrad)" />
      <ellipse cx="80" cy="78" rx="16" ry="12" fill="url(#snoutGrad)" />
      <polygon points="75,74 85,74 80,80" fill="#4a2e1b" />
      <path d="M80 80 L80 84 M76 84 Q80 88 84 84" stroke="#4a2e1b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Eyes (Winking one eye playfully!) */}
      <ellipse cx="66" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="64" cy="63" r="1.8" fill="#fff" />
      <path d="M90 65 Q95 60 100 65" stroke="#4a2e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* HELD CAMERA */}
      <g transform="translate(54, 104)">
        <rect x="0" y="4" width="52" height="34" rx="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <rect x="6" y="0" width="14" height="6" rx="2" fill="#0284c7" />
        <circle cx="42" cy="10" r="3" fill="#facc15" />
        {/* Lens */}
        <circle cx="26" cy="21" r="11" fill="#1e293b" />
        <circle cx="26" cy="21" r="7" fill="#0f172a" />
        <circle cx="24" cy="19" r="2.5" fill="#ffffff" />
      </g>
      {/* Paws */}
      <circle cx="54" cy="120" r="9" fill="url(#snoutGrad)" />
      <circle cx="106" cy="120" r="9" fill="url(#snoutGrad)" />
    </motion.svg>
  );
};

/**
 * 4. Teddy Holding Music Note (Music Section)
 */
export const MusicTeddy = ({ className = 'w-16 h-16', active = false }) => {
  return (
    <motion.svg
      viewBox="0 0 160 170"
      className={`${className} drop-shadow-md`}
      animate={active ? { scale: [1, 1.08, 1], rotate: [-2, 2, -2] } : { y: [0, -3, 0] }}
      transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      <ellipse cx="80" cy="160" rx="42" ry="7" fill="url(#shadowGrad)" />
      {/* Ears */}
      <circle cx="50" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="50" cy="45" r="9" fill="url(#earGrad)" />
      <circle cx="110" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="110" cy="45" r="9" fill="url(#earGrad)" />
      {/* Headphones on Teddy! */}
      <path d="M46 65 Q80 28 114 65" stroke="#f43f5e" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="68" r="11" fill="#fb7185" />
      <circle cx="116" cy="68" r="11" fill="#fb7185" />

      {/* Body & Head */}
      <ellipse cx="80" cy="118" rx="34" ry="38" fill="url(#furGrad)" />
      <circle cx="80" cy="70" r="36" fill="url(#furGrad)" />
      <circle cx="60" cy="80" r="10" fill="url(#blushGrad)" />
      <circle cx="100" cy="80" r="10" fill="url(#blushGrad)" />
      <ellipse cx="80" cy="78" rx="16" ry="12" fill="url(#snoutGrad)" />
      <polygon points="75,74 85,74 80,80" fill="#4a2e1b" />
      <path d="M80 80 L80 84 M76 84 Q80 88 84 84" stroke="#4a2e1b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Singing Happy Eyes */}
      <path d="M62 65 Q66 60 70 65" stroke="#4a2e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M90 65 Q94 60 98 65" stroke="#4a2e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* HELD MUSIC NOTE */}
      <motion.g
        animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        transform="translate(68, 102)"
      >
        <path d="M12 28 C8 28 4 32 4 36 C4 40 8 43 13 43 C18 43 21 39 21 35 L21 10 L38 5 L38 28 C34 28 30 32 30 36 C30 40 34 43 39 43 C44 43 47 39 47 35 L47 0 L12 6 Z" fill="#8b5cf6" filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))" />
        <circle cx="4" cy="5" r="2" fill="#facc15" />
        <circle cx="48" cy="15" r="2.5" fill="#facc15" />
      </motion.g>
      {/* Paws */}
      <circle cx="60" cy="122" r="9" fill="url(#snoutGrad)" />
      <circle cx="100" cy="122" r="9" fill="url(#snoutGrad)" />
    </motion.svg>
  );
};

/**
 * 5. Teddy Holding Heart (Special Message Section)
 */
export const HeartTeddy = ({ className = 'w-16 h-16', active = false }) => {
  return (
    <motion.svg
      viewBox="0 0 160 170"
      className={`${className} drop-shadow-md`}
      animate={active ? { scale: [1, 1.1, 1], y: [0, -5, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      <ellipse cx="80" cy="160" rx="42" ry="7" fill="url(#shadowGrad)" />
      {/* Ears */}
      <circle cx="50" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="50" cy="45" r="9" fill="url(#earGrad)" />
      <circle cx="110" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="110" cy="45" r="9" fill="url(#earGrad)" />
      {/* Body & Head */}
      <ellipse cx="80" cy="118" rx="34" ry="38" fill="url(#furGrad)" />
      <circle cx="80" cy="70" r="36" fill="url(#furGrad)" />
      <circle cx="60" cy="80" r="10" fill="url(#blushGrad)" />
      <circle cx="100" cy="80" r="10" fill="url(#blushGrad)" />
      <ellipse cx="80" cy="78" rx="16" ry="12" fill="url(#snoutGrad)" />
      <polygon points="75,74 85,74 80,80" fill="#4a2e1b" />
      <path d="M80 80 L80 84 M76 84 Q80 88 84 84" stroke="#4a2e1b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Loving Eyes */}
      <ellipse cx="66" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="64" cy="63" r="1.8" fill="#fff" />
      <ellipse cx="94" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="92" cy="63" r="1.8" fill="#fff" />

      {/* HELD GLOWING RUBY HEART */}
      <motion.g
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '80px', originY: '120px' }}
      >
        <path
          d="M80 108 C73 98 52 102 52 118 C52 134 80 148 80 148 C80 148 108 134 108 118 C108 102 87 98 80 108 Z"
          fill="#f43f5e"
          stroke="#e11d48"
          strokeWidth="2"
          filter="drop-shadow(0 3px 6px rgba(244, 63, 94, 0.45))"
        />
        {/* Heart highlight shine */}
        <ellipse cx="65" cy="114" rx="4" ry="7" transform="rotate(-30 65 114)" fill="#ffffff" opacity="0.6" />
      </motion.g>
      {/* Paws wrapped around heart */}
      <circle cx="56" cy="120" r="9" fill="url(#snoutGrad)" />
      <circle cx="104" cy="120" r="9" fill="url(#snoutGrad)" />
    </motion.svg>
  );
};

/**
 * 6. Teddy Holding Gift Box (Final Surprise Section)
 */
export const GiftTeddy = ({ className = 'w-16 h-16', active = false }) => {
  return (
    <motion.svg
      viewBox="0 0 160 170"
      className={`${className} drop-shadow-md`}
      animate={active ? { scale: [1, 1.1, 1], y: [0, -6, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <TeddyDefs />
      <ellipse cx="80" cy="160" rx="42" ry="7" fill="url(#shadowGrad)" />
      {/* Ears */}
      <circle cx="50" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="50" cy="45" r="9" fill="url(#earGrad)" />
      <circle cx="110" cy="45" r="15" fill="url(#furGrad)" />
      <circle cx="110" cy="45" r="9" fill="url(#earGrad)" />
      {/* Party Hat on Teddy! */}
      <polygon points="80,18 68,48 92,48" fill="#f59e0b" />
      <circle cx="80" cy="16" r="4" fill="#ef4444" />
      <path d="M72 38 L88 38" stroke="#ef4444" strokeWidth="2.5" />

      {/* Body & Head */}
      <ellipse cx="80" cy="118" rx="34" ry="38" fill="url(#furGrad)" />
      <circle cx="80" cy="70" r="36" fill="url(#furGrad)" />
      <circle cx="60" cy="80" r="10" fill="url(#blushGrad)" />
      <circle cx="100" cy="80" r="10" fill="url(#blushGrad)" />
      <ellipse cx="80" cy="78" rx="16" ry="12" fill="url(#snoutGrad)" />
      <polygon points="75,74 85,74 80,80" fill="#4a2e1b" />
      <path d="M80 80 L80 84 M76 84 Q80 88 84 84" stroke="#4a2e1b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Excited Sparkly Eyes */}
      <ellipse cx="66" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="64" cy="63" r="2" fill="#fff" />
      <ellipse cx="94" cy="65" rx="5" ry="6" fill="url(#eyeGrad)" />
      <circle cx="92" cy="63" r="2" fill="#fff" />

      {/* HELD GIFT BOX WITH GOLDEN RIBBON */}
      <g transform="translate(56, 102)">
        <rect x="0" y="8" width="48" height="34" rx="4" fill="#ec4899" stroke="#db2777" strokeWidth="1.5" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.18))" />
        {/* Lid */}
        <rect x="-3" y="4" width="54" height="8" rx="3" fill="#f43f5e" />
        {/* Golden Ribbon */}
        <rect x="20" y="4" width="8" height="38" fill="#facc15" />
        {/* Bow */}
        <ellipse cx="18" cy="3" rx="6" ry="4" fill="#facc15" />
        <ellipse cx="30" cy="3" rx="6" ry="4" fill="#facc15" />
        <circle cx="24" cy="4" r="3" fill="#eab308" />
      </g>
      {/* Paws holding box */}
      <circle cx="56" cy="120" r="9" fill="url(#snoutGrad)" />
      <circle cx="104" cy="120" r="9" fill="url(#snoutGrad)" />
    </motion.svg>
  );
};
