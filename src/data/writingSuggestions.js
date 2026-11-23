/**
 * Little Moments - Writing Assistant Inspirations
 * Provides sweet, thoughtful, occasion-tailored greetings, letter paragraphs,
 * and closings that the creator can optionally insert.
 */

export const WRITING_INSPIRATIONS = {
  birthday: {
    greetings: [
      "Dearest Birthday Star,",
      "Happy Birthday to my favorite human,",
      "To the sweetest soul I know,",
      "Another year more radiant than ever,",
    ],
    paragraphs: [
      "Today is all about celebrating you—your kind heart, your contagious laugh, and the endless warmth you bring into my world.",
      "I hope this year brings you as much happiness, peace, and pure magic as you effortlessly bring into everyone else's lives.",
      "Looking back at all the memories we've shared, I couldn't be more grateful for every single laugh and late-night conversation.",
    ],
    closings: [
      "With all my love and biggest hugs,",
      "Wishing you the most magical year ahead,",
      "Forever celebrating you,",
      "Yours always,",
    ],
  },
  valentine: {
    greetings: [
      "My Dearest Love,",
      "To the one who holds my heart,",
      "My forever Valentine,",
      "To my sweetest dream come true,",
    ],
    paragraphs: [
      "From the very moment you walked into my life, everything became softer, brighter, and infinitely more beautiful.",
      "You make ordinary days feel like poetry, and in your eyes, I found my favorite place to call home.",
      "Thank you for loving me with patience, laughing with me through the chaos, and holding my hand through every storm.",
    ],
    closings: [
      "Forever and always yours,",
      "With every beat of my heart,",
      "Yours unconditionally,",
      "All my love,",
    ],
  },
  anniversary: {
    greetings: [
      "Happy Anniversary, my soulmate,",
      "To my partner in everything,",
      "Another beautiful year together,",
      "To the love of my life,",
    ],
    paragraphs: [
      "Through every milestone and quiet evening, loving you has been the easiest and most wonderful adventure of my life.",
      "Here's to celebrating how far we've come, the home we've built in each other's hearts, and all the dreams still waiting for us.",
    ],
    closings: [
      "Cheers to our forever,",
      "With all my devotion and love,",
      "Yours for a lifetime,",
    ],
  },
  friendship: {
    greetings: [
      "Hey bestie,",
      "To my partner in crime,",
      "Dear friend of my heart,",
      "To the one who knows me best,",
    ],
    paragraphs: [
      "I was just thinking about how lucky I am to have someone who understands my silence just as well as my loudest laughs.",
      "Thank you for always having my back, sending me hilarious memes, and reminding me of who I am when life gets crazy.",
    ],
    closings: [
      "Friends for life and beyond,",
      "With huge hugs and high fives,",
      "Your partner in crime always,",
    ],
  },
  diwali: {
    greetings: [
      "Shubh Deepavali,",
      "Dearest family & friends,",
      "Warmest Diwali blessings,",
      "May this festival of lights illuminate your life,",
    ],
    paragraphs: [
      "May the glowing diyas bring boundless health, divine prosperity, and peaceful joy into your home and heart.",
      "Wishing you sweet moments with loved ones, delicious feasts, and sparkles of good fortune all year round.",
    ],
    closings: [
      "Wishing you a bright and blessed Diwali,",
      "With warm festive regards and love,",
      "May light always triumph,",
    ],
  },
  default: {
    greetings: [
      "Dearest,",
      "Thinking of you today,",
      "A special surprise just for you,",
      "To someone truly special,",
    ],
    paragraphs: [
      "Some moments deserve more than just a quick text—they deserve to be wrapped in love and remembered forever.",
      "I wanted to take a moment out of the busy world to remind you how much you mean to me and how grateful I am for you.",
    ],
    closings: [
      "With all my warmth,",
      "Made with love, just for you,",
      "Always thinking of you,",
    ],
  },
};

export function getInspirationsForOccasion(occasionId) {
  return WRITING_INSPIRATIONS[occasionId] || WRITING_INSPIRATIONS.default;
}
