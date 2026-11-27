/**
 * Little Moments - Sample Starter Gifts
 * Ready-to-experience sample gifts for immediate testing and demonstration.
 * All default sample PINs are set to "1234" (hashed).
 */

export const SAMPLE_GIFTS = [
  {
    id: 'sample-bday-01',
    slug: 'sweet-birthday-aria',
    creator_id: 'demo-user-1',
    occasion: 'birthday',
    recipient_name: 'Aria',
    theme_id: 'bday_pastel',
    letter_content: {
      greeting: 'Dearest Aria,',
      body: 'Happy Birthday to the most sunshine-filled human in my life!\n\nEver since we met, you have brought so much kindness, laughter, and spontaneous adventure into every single day. I wanted to make something truly special to remind you just how deeply appreciated and celebrated you are.\n\nMay this year be full of serendipitous moments, warm cups of tea, exciting triumphs, and all the love your big heart can hold.',
      closing: 'With all my warmest love & biggest hugs,',
      sender_name: 'Leo ♡',
    },
    letter_font: 'cursive',
    letter_settings: {
      fontSize: 22,
      textColor: '#374151',
      textAlign: 'center',
      lineHeight: 1.8,
    },
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
        caption: 'Celebrating life with lots of sweet frosting & joy! 🎂',
        display_order: 1,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
        caption: 'Balloons, sunshine, and endless laughter together ✨',
        display_order: 2,
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80',
        caption: 'Making wishes for the most magical year ahead 🎈',
        display_order: 3,
      },
    ],
    settings: {
      music_enabled: true,
      music_track: 'sweet_music_box',
      music_title: 'Sweet Music Box Lullaby',
      animation_type: 'birthday_confetti',
    },
    special_message: {
      quote: '"You don\'t just get older, you grow more radiant and treasured with every single passing day."',
      note: 'P.S. I hid a tiny real-life surprise in your backpack, go check it whenever you get home! 😊',
    },
    final_message: {
      headline: 'Make a Wish, Beautiful Soul! 🌟',
      body: 'Here is to a lifetime of laughter, good health, and dreams that unfold in the most wonderful ways imaginable.',
      surprise_box_label: 'Tap to Unwrap Your Birthday Joy! 🎁',
    },
    password_type: 'pin',
    // Salt and SHA-256 hash for PIN "1234"
    password_salt: 'e9a4f6120b84c31a',
    // hash(`${salt}:1234`)
    password_hash: '74f7d4cd97621ddd07e76f4f7d380ab87dd5f4a6c5287b82bd0d253d20bbfbfb',
    published: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-val-02',
    slug: 'forever-valentine-ethan',
    creator_id: 'demo-user-1',
    occasion: 'valentine',
    recipient_name: 'Ethan',
    theme_id: 'val_romantic_hearts',
    letter_content: {
      greeting: 'My Dearest Ethan,',
      body: 'Some moments deserve more than just ordinary words.\n\nFrom the very quiet morning coffee talks to the wildest road trips under starry skies, having you beside me has turned my world into the warmest story.\n\nThank you for loving me exactly as I am, holding my hand through every storm, and giving me a million reasons to smile every single day.',
      closing: 'Forever and always yours,',
      sender_name: 'Maya ♡',
    },
    letter_font: 'cursive',
    letter_settings: {
      fontSize: 22,
      textColor: '#1f2937',
      textAlign: 'center',
      lineHeight: 1.8,
    },
    photos: [
      {
        id: 'vp1',
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
        caption: 'Our favorite evening walk along the quiet coastline 🌅',
        display_order: 1,
      },
      {
        id: 'vp2',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
        caption: 'Two hearts beating in synchronous melody 💖',
        display_order: 2,
      },
    ],
    settings: {
      music_enabled: true,
      music_track: 'piano_stardust',
      music_title: 'Stardust Piano Reverie',
      animation_type: 'floating_hearts',
    },
    special_message: {
      quote: '"In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."',
      note: 'Happy Valentine\'s Day my love. Dinner reservation is at 7:30 PM tonight—dress sharp! 🥂',
    },
    final_message: {
      headline: 'You Are My Favorite Beginning & My Forever Home ♡',
      body: 'Thank you for making every day feel like a love song.',
      surprise_box_label: 'Tap to Reveal Love Note 🌹',
    },
    password_type: 'pin',
    password_salt: 'e9a4f6120b84c31a',
    password_hash: '74f7d4cd97621ddd07e76f4f7d380ab87dd5f4a6c5287b82bd0d253d20bbfbfb',
    published: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-diwali-03',
    slug: 'shubh-diwali-sharma-family',
    creator_id: 'demo-user-1',
    occasion: 'diwali',
    recipient_name: 'Sharma Family',
    theme_id: 'diwali_golden_diya',
    letter_content: {
      greeting: 'Dearest Family,',
      body: 'Shubh Deepavali to all of you!\n\nMay the warm glow of the diyas illuminate your home with peace, abundant prosperity, and sweet happiness.\n\nEven though miles separate us this festive season, my prayers and love are with you in every prayer and celebration. May Lord Ganesha and Goddess Lakshmi bless your household with boundless joy.',
      closing: 'With heartfelt pranaams & warmest love,',
      sender_name: 'Ananya & Rohan 🪔',
    },
    letter_font: 'serif_royal',
    letter_settings: {
      fontSize: 20,
      textColor: '#fef3c7',
      textAlign: 'center',
      lineHeight: 1.8,
    },
    photos: [
      {
        id: 'dp1',
        url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&auto=format&fit=crop&q=80',
        caption: 'Lighting lamps of hope, happiness and gratitude 🪔',
        display_order: 1,
      },
      {
        id: 'dp2',
        url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop&q=80',
        caption: 'Sparkling skies and festive family warmth ✨',
        display_order: 2,
      },
    ],
    settings: {
      music_enabled: true,
      music_track: 'festive_joy',
      music_title: 'Festive Sparkler Celebration',
      animation_type: 'diwali_sparklers',
    },
    special_message: {
      quote: '"May the divine light of Diwali shine bright in your life, dissolving all darkness and lighting new paths of prosperity."',
      note: 'Sending a box of special Kaju Katli and dry fruits your way via courier! 🍬',
    },
    final_message: {
      headline: 'May Joy & Light Reside In Your Home Always! 🪔✨',
      body: 'Wishing you a grand and joyous Festival of Lights filled with laughter, love, and sweet delicacies.',
      surprise_box_label: 'Light the Festive Diya! 🪔',
    },
    password_type: 'pin',
    password_salt: 'e9a4f6120b84c31a',
    password_hash: '74f7d4cd97621ddd07e76f4f7d380ab87dd5f4a6c5287b82bd0d253d20bbfbfb',
    published: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
