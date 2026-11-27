# Little Moments – A Gift Made Just for You 🎁

> A beautiful, responsive digital gifting platform where a creator can privately craft personalized surprises for someone special, publish them using a unique link, and let the recipient unlock and enjoy the surprise using a secret PIN or password.

---

## 1. Project Overview

**Little Moments** provides two completely separate, purpose-built interfaces:
1. **Creator Dashboard**: A private, authenticated space where creators write personal letters, curate photo scrapbook memories, choose background music, select festive themes, set passwords, and manage published gifts.
2. **Recipient Experience**: A magical, distraction-free surprise interface accessed via unique non-guessable links. Recipients see zero creator controls, unlock the gift with an on-screen keypad guided by an animated 3D teddy bear, watch a realistic 3D envelope unfold, read personal letters, view memories, and trigger festive celebration fireworks.

---

## 2. Key Features

- **Two Completely Separate Interfaces**:
  - The recipient never sees dashboard controls, creator settings, or editing buttons.
- **Cute Welcome Screen & Keypad**:
  - Exact headline: *"Hey, today is a special day!"*
  - Supporting text: *"Some moments deserve more than just words. Someone has prepared a little surprise for you. Open your heart and discover it!"*
  - Adorable animated 3D teddy bear pointing to the on-screen keypad with floating hearts, sparkles, and glowing particles.
  - Functional numeric keypad (1–9, *, 0, #, backspace, clear, unlock) with keyboard input support, filled password dots, and friendly rate-limiting errors.
  - Support for both numeric PINs and alphanumeric passwords.
- **Occasions & Distinct Themes**:
  - 28 Occasions: Birthday, Wedding, Anniversary, Valentine's Day, Friendship, Friendship Day, Teacher's Day, Mother's Day, Father's Day, Family, Congratulations, Thank You, Get Well Soon, Farewell, Pets, New Year, Custom Occasion, and 11 distinct Festivals (Diwali, Christmas, Eid, Holi, Ugadi, Sankranti/Pongal, Onam, Ganesh Chaturthi, Navratri, Raksha Bandhan, Baisakhi, and Other Festivals).
  - **At least 3 visually distinct themes for EVERY occasion** with bespoke color palettes, paper textures, decorative elements, and typography.
- **Interactive 3D Animated Teddy Bear Navigation**:
  - Teddy holding envelope -> Letter
  - Teddy holding camera -> Memories
  - Teddy holding music note -> Music
  - Teddy holding heart -> Special Message
  - Teddy holding gift box -> Final Surprise
- **Letter Creation & Live Preview**:
  - Rich typography: Elegant Cursive, Handwritten, Classic Serif, Royal Gold Serif, Cute Rounded, and Modern Minimal.
  - Live preview with folding/unfolding 3D envelope and wax seals.
  - Optional AI writing assistant with greetings, paragraphs, and closings.
- **Scrapbook Memories Gallery**:
  - Polaroid-style cards with washi tape, tilt angles, captions, and lightbox zoom with previous/next navigation.
- **Procedural Background Audio Player**:
  - Web Audio API procedural sound engine with 4 royalty-free melodies (Sweet Music Box, Acoustic Sunset, Piano Stardust, Festive Joy) plus custom audio file upload support.
- **Final Surprise & Fireworks**:
  - Occasion-tailored confetti and particle bursts (floating hearts for Valentine/Weddings, diyas and sparklers for Festivals, bouncy stars for Pets, celebration confetti for Birthdays).
  - Replay button so recipients can experience the surprise again.
- **Dual Mode (Production Supabase + Local Demo Mode)**:
  - Works out-of-the-box in local offline mode with pre-loaded demo gifts (PIN: `1234`), local storage, and client-side salted SHA-256 hashing.
  - Connects seamlessly to Supabase for cloud PostgreSQL database, authentication, private storage buckets, and Edge Functions.

---

## 3. Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Animations**: Framer Motion, Canvas Confetti
- **Audio**: Web Audio API (procedural synthesis) & HTML5 Audio
- **Security & Crypto**: Web Crypto API (salted SHA-256 password hashing)
- **Backend & Cloud**: Supabase Authentication, PostgreSQL Database, Row Level Security (RLS), Supabase Storage, and Deno Edge Functions

---

## 4. Folder Structure

```
Little Moments/
├── dist/                          # Production build output
├── public/                        # Static assets
├── src/
│   ├── assets/                    # Project logos and illustrations
│   ├── components/
│   │   ├── common/                # Shared UI
│   │   │   ├── ConfettiEffect.jsx # Occasion-tailored particle bursts
│   │   │   ├── Navbar.jsx         # Creator navigation bar
│   │   │   ├── ParticleBackground.jsx # Floating hearts and sparkles
│   │   │   └── TeddyCharacters.jsx # 3D SVG animated teddy bears
│   │   ├── creator/               # Creator Interface
│   │   │   ├── AuthModal.jsx      # Sign in & sign up modal
│   │   │   ├── CreatorDashboard.jsx # Dashboard with tabs (My Gifts, Drafts, Published, etc.)
│   │   │   ├── GiftWizard.jsx     # Multi-step gift creation wizard with live preview
│   │   │   └── SupabaseSetupGuide.jsx # In-app Supabase connection modal
│   │   └── recipient/             # Recipient Interface (Strictly isolated)
│   │       ├── EnvelopeLetter.jsx # 3D envelope unfolding animation
│   │       ├── FinalSurpriseView.jsx # Final unboxing with fireworks
│   │       ├── Keypad.jsx         # Welcome screen, keypad, pointing teddy
│   │       ├── MemoryGallery.jsx  # Polaroid scrapbook lightbox
│   │       ├── MusicPlayer.jsx    # Floating music controller
│   │       ├── RecipientExperience.jsx # Recipient container
│   │       ├── SpecialMessageView.jsx # Dedicated heartfelt message
│   │       └── TeddyNav.jsx       # 5-Teddy interactive navigation
│   ├── data/
│   │   ├── sampleGifts.js         # Pre-configured demo gifts (PIN: 1234)
│   │   ├── themes.js              # 3+ themes per occasion (80+ unique themes)
│   │   └── writingSuggestions.js  # Occasion-tailored writing assistant
│   ├── lib/
│   │   ├── audioPresets.js        # Procedural Web Audio engine
│   │   ├── cryptoUtils.js         # Salted SHA-256 hashing & rate limiting
│   │   ├── supabaseClient.js      # Unified service layer (Supabase + Local fallback)
│   │   └── types.js               # Occasions, fonts, constants
│   ├── supabase/
│   │   ├── functions/
│   │   │   └── verify-gift-password/index.ts # Deno Edge Function
│   │   └── schema.sql             # SQL schema, RLS policies, RPC verification
│   ├── App.jsx                    # Application routing
│   ├── index.css                  # Global styles & Google Fonts
│   └── main.jsx                   # React root entry
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite bundler configuration
└── README.md                      # Documentation
```

---

## 5. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `little-moments`.
3. In your project dashboard, navigate to **Project Settings** → **API**.
4. Copy your **Project URL** and **anon public** API key.

---

## 6. Environment Variable Setup

Create a `.env` file in the project root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Note**: If `.env` is omitted, the website automatically operates in **Local Demo Mode** using browser storage and local cryptographic hashing, so you can test all features immediately without any configuration.

---

## 7. Database Setup

1. Open your Supabase Dashboard and click on **SQL Editor**.
2. Click **New query**.
3. Copy and paste the contents of `src/supabase/schema.sql`.
4. Click **Run**.

This script sets up:
- `gifts` table with JSONB columns for letters, settings, and salted password hashes.
- `gift_photos` table with cascade deletion.
- `gift_settings` table for music and animations.
- `password_attempts` table for rate-limiting brute-force attempts.
- Row Level Security (RLS) policies ensuring creators can only access their own gifts.
- `verify_gift_password` RPC function.

---

## 8. Storage Setup

1. In Supabase Dashboard, click on **Storage**.
2. Click **New bucket**.
3. Bucket name: `gift-media`.
4. Ensure **Public bucket** is toggled **OFF** (Private).
5. Photos and audio are accessed through temporary signed URLs generated upon password verification.

---

## 9. Edge Function Deployment

To deploy the password verification Edge Function:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy the verify-gift-password edge function
supabase functions deploy verify-gift-password
```

---

## 10. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 11. Building the Project

```bash
npm run build
```

The production output is generated in the `dist/` directory.

---

## 12. Deployment

### GitHub Pages Deployment
Because Little Moments uses `base: './'` in `vite.config.js` and `HashRouter` for routing (`/#/gift/:slug`), it can be hosted directly on GitHub Pages:
1. Build the project: `npm run build`
2. Push the contents of the `dist/` directory to the `gh-pages` branch.
3. Access your site at `https://<username>.github.io/<repo>/`.

### Vercel / Netlify Deployment
1. Connect your GitHub repository to Vercel or Netlify.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the environment variables in your deployment dashboard.

---

## 13. Testing Verification

All 20 required scenarios have been designed, implemented, and verified:

1. **Creator Registration & Login**: Works via Supabase Auth and one-click Demo Mode.
2. **Gift Creation**: Multi-step wizard with real-time state management.
3. **Occasions**: All 28 occasions and festival sub-categories are searchable and selectable.
4. **Three Themes Per Occasion**: Over 80 distinct themes cataloged in `src/data/themes.js`.
5. **Letter Editor**: Rich controls for greetings, body, fonts, size, colors, alignments, and AI writing suggestions.
6. **Photo Uploads**: Multi-file upload, captions, reordering, and deletion.
7. **Music Settings**: Procedural audio engine with 4 tracks plus custom upload option.
8. **Password/PIN Protection**: Numeric PIN with on-screen keypad or alphanumeric password with salted SHA-256 hashing.
9. **Draft Saving**: Saves unfinished gifts with draft status.
10. **Live Preview**: Full modal previewing the exact recipient experience.
11. **Publishing**: Generates unique non-guessable slugs and updates status.
12. **Recipient Link Opening**: Direct link (`/#/gift/:slug`) loads the isolated recipient interface.
13. **Correct Password Unlock**: Transitions smoothly from lockscreen to envelope.
14. **Incorrect Password Rejection**: Shows friendly error messages, shakes keypad, and tracks attempt limits.
15. **Interface Isolation**: Zero creator tools, edit buttons, or dashboard links on the recipient page.
16. **Data Protection**: Sensitive contents remain hidden until password verification succeeds.
17. **Teddy Bear Navigation**: 5 animated 3D teddy bears switch sections interactively.
18. **Music Player**: Floating player with play/pause, volume slider, and mute.
19. **Responsive Design**: Tested on mobile and desktop viewports.
20. **Replay Feature**: Recipient can replay the celebration and unwrap the gift again.
#   L i t t l e - m o m e n t s  
 