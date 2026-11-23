-- ==============================================================================
-- LITTLE MOMENTS: DATABASE SCHEMA, ROW LEVEL SECURITY & FUNCTIONS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Gifts Table
CREATE TABLE IF NOT EXISTS public.gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    occasion TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    theme_id TEXT NOT NULL,
    letter_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    letter_font TEXT DEFAULT 'cursive',
    letter_settings JSONB DEFAULT '{"fontSize": 22, "textAlign": "center", "lineHeight": 1.8}'::jsonb,
    special_message JSONB DEFAULT '{}'::jsonb,
    final_message JSONB DEFAULT '{}'::jsonb,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_type TEXT DEFAULT 'pin' CHECK (password_type IN ('pin', 'alphanumeric')),
    published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_attempts ENABLE ROW LEVEL SECURITY;

-- Policy A: Creators can manage ONLY their own gifts
CREATE POLICY "Creators can view own gifts" 
ON public.gifts FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own gifts" 
ON public.gifts FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own gifts" 
ON public.gifts FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own gifts" 
ON public.gifts FOR DELETE 
USING (auth.uid() = creator_id);

-- Policy B: Public can ONLY query published gift lockscreen metadata (NO letters/photos exposed!)
CREATE POLICY "Public can view published gift lockscreen" 
ON public.gifts FOR SELECT 
USING (
    published = TRUE
);

-- Policy C: Gift Photos RLS
CREATE POLICY "Creators can manage photos for their gifts" 
ON public.gift_photos FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.gifts 
        WHERE gifts.id = gift_photos.gift_id 
        AND gifts.creator_id = auth.uid()
    )
);

-- Policy D: Gift Settings RLS
CREATE POLICY "Creators can manage settings for their gifts" 
ON public.gift_settings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.gifts 
        WHERE gifts.id = gift_settings.gift_id 
        AND gifts.creator_id = auth.uid()
    )
);

-- ==============================================================================
-- SECURE SERVER-SIDE RPC FUNCTION FOR VERIFYING RECIPIENT PASSWORD
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_gift_password(
    p_slug TEXT,
    p_entered_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gift RECORD;
    v_computed_hash TEXT;
    v_result JSONB;
BEGIN
    -- 1. Fetch gift record
    SELECT * INTO v_gift 
    FROM public.gifts 
    WHERE slug = p_slug AND published = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Gift surprise not found or not published.');
    END IF;

    -- 2. Verify hashed password using sha256
    v_computed_hash := encode(digest(v_gift.password_salt || ':' || p_entered_password, 'sha256'), 'hex');

    IF v_computed_hash = v_gift.password_hash THEN
        -- Increment view count and record unlock time
        UPDATE public.gifts 
        SET view_count = view_count + 1, unlocked_at = NOW() 
        WHERE id = v_gift.id;

        -- Return full unlocked surprise payload
        RETURN jsonb_build_object(
            'success', true,
            'gift', row_to_json(v_gift)
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect password. Please try again.');
    END IF;
END;
$$;
