import confetti from 'canvas-confetti';

/**
 * Occasion-tailored confetti and particle bursts
 */
export function fireOccasionSurprise(occasion = 'birthday') {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  if (occasion === 'valentine' || occasion === 'anniversary') {
    // Floating hearts & romantic rose petals
    confetti({
      ...defaults,
      particleCount: 80,
      spread: 90,
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#be123c'],
      shapes: ['circle'],
      scalar: 1.4,
    });
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 60,
        angle: 60,
        spread: 70,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#ffccd5', '#ff4d6d'],
      });
      confetti({
        ...defaults,
        particleCount: 60,
        angle: 120,
        spread: 70,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#ffccd5', '#ff4d6d'],
      });
    }, 250);
    return;
  }

  if (occasion === 'wedding') {
    // Ivory & gold elegant celebration
    confetti({
      ...defaults,
      particleCount: 120,
      spread: 100,
      colors: ['#fef3c7', '#f59e0b', '#d97706', '#ffffff', '#e2e8f0'],
      scalar: 1.2,
    });
    return;
  }

  if (['diwali', 'eid', 'sankranti', 'ugadi', 'onam', 'ganesh_chaturthi', 'navratri', 'raksha_bandhan', 'baisakhi', 'other_festivals'].includes(occasion)) {
    // Festival golden sparklers and joyous colors
    confetti({
      ...defaults,
      particleCount: 160,
      spread: 120,
      colors: ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#10b981', '#facc15'],
      scalar: 1.3,
    });
    return;
  }

  if (occasion === 'pets') {
    // Playful animal bursts
    confetti({
      ...defaults,
      particleCount: 90,
      spread: 80,
      colors: ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa'],
      scalar: 1.2,
    });
    return;
  }

  // Default Birthday / Congratulations fireworks burst
  confetti({
    ...defaults,
    particleCount: count,
    spread: 110,
    colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#f43f5e'],
    scalar: 1.2,
  });

  // Secondary firework bursts on the sides
  setTimeout(() => {
    confetti({
      particleCount: 75,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.5 },
      colors: ['#ff4081', '#ffea00', '#00e5ff'],
    });
    confetti({
      particleCount: 75,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.5 },
      colors: ['#ff4081', '#ffea00', '#00e5ff'],
    });
  }, 300);
}
