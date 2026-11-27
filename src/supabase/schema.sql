-- ==============================================================================
-- LITTLE MOMENTS: DATABASE SCHEMA, ROW LEVEL SECURITY & FUNCTIONS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Gifts Table
CREATE TABLE IF NOT EXISTS public.gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID,
    slug TEXT UNIQUE NOT NULL,
    occasion TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    theme_id TEXT NOT NULL,
    letter_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    letter_font TEXT DEFAULT 'cursive',
    letter_settings JSONB DEFAULT '{"fontSize": 22, "textAlign": "center", "lineHeight": 1.8}'::jsonb,
    special_message JSONB DEFAULT '{}'::jsonb,
    final_message JSONB DEFAULT '{}'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_type TEXT DEFAULT 'pin' CHECK (password_type IN ('pin', 'alphanumeric')),
    published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure nullable creator_id and remove strict foreign key to auth.users if exists
ALTER TABLE public.gifts ALTER COLUMN creator_id DROP NOT NULL;
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_creator_id_fkey;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Index for fast recipient slug lookup
CREATE INDEX IF NOT EXISTS idx_gifts_slug ON public.gifts(slug);
CREATE INDEX IF NOT EXISTS idx_gifts_creator_id ON public.gifts(creator_id);

-- 3. Gift Photos Table
CREATE TABLE IF NOT EXISTS public.gift_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    caption TEXT DEFAULT '',
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_photos_gift_id ON public.gift_photos(gift_id);

-- 4. Gift Settings Table
CREATE TABLE IF NOT EXISTS public.gift_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE NOT NULL,
    music_path TEXT,
    music_enabled BOOLEAN DEFAULT TRUE,
    final_music_path TEXT,
    ambient_sound TEXT,
    animation_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Rate Limiting Table (Prevents Brute-Force Password Guessing)
CREATE TABLE IF NOT EXISTS public.password_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_slug TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_slug_ip UNIQUE(gift_slug, ip_hash)
);

-- ==============================================================================
-- DATABASE PERMISSIONS (Crucial for PostgREST & Edge Functions)
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_attempts ENABLE ROW LEVEL SECURITY;

-- Policy A: Public can ONLY query published gifts
DROP POLICY IF EXISTS "Public can view published gift lockscreen" ON public.gifts;
CREATE POLICY "Public can view published gift lockscreen" 
ON public.gifts FOR SELECT 
USING (published = true);

-- Policy B: Creators can insert gifts
DROP POLICY IF EXISTS "Creators can insert own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can insert gifts" ON public.gifts;
CREATE POLICY "Anyone can insert gifts" 
ON public.gifts FOR INSERT 
WITH CHECK (true);

-- Policy C: Creators can update gifts
DROP POLICY IF EXISTS "Creators can update own gifts" ON public.gifts;
CREATE POLICY "Creators can update own gifts" 
ON public.gifts FOR UPDATE 
USING (true) WITH CHECK (true);

-- Policy D: Creators can delete gifts
DROP POLICY IF EXISTS "Creators can delete own gifts" ON public.gifts;
CREATE POLICY "Creators can delete own gifts" 
ON public.gifts FOR DELETE 
USING (true);

-- Policy E: Gift Photos RLS
DROP POLICY IF EXISTS "Creators can manage photos for their gifts" ON public.gift_photos;
DROP POLICY IF EXISTS "Allow all on gift_photos" ON public.gift_photos;
CREATE POLICY "Allow all on gift_photos" 
ON public.gift_photos FOR ALL 
USING (true) WITH CHECK (true);

-- Policy F: Gift Settings RLS
DROP POLICY IF EXISTS "Creators can manage settings for their gifts" ON public.gift_settings;
DROP POLICY IF EXISTS "Allow all on gift_settings" ON public.gift_settings;
CREATE POLICY "Allow all on gift_settings" 
ON public.gift_settings FOR ALL 
USING (true) WITH CHECK (true);

-- Policy G: Password Attempts RLS
DROP POLICY IF EXISTS "Allow all on password_attempts" ON public.password_attempts;
CREATE POLICY "Allow all on password_attempts" 
ON public.password_attempts FOR ALL 
USING (true) WITH CHECK (true);
