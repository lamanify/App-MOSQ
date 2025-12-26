-- MOSQ Database Schema Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MOSQUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mosques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline TEXT,
  address TEXT,
  state VARCHAR(100),
  zone_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_url TEXT,
  hero_image_url TEXT,
  about_text TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp_link TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  telegram_url TEXT,
  bank_name VARCHAR(255),
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  donation_qr_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMINS TABLE (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mosque_id UUID REFERENCES mosques(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMITTEE MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TYPE announcement_category AS ENUM (
  'umum',
  'aktiviti',
  'kewangan',
  'waktu_solat',
  'lain_lain'
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category announcement_category DEFAULT 'umum',
  publish_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(500),
  speaker VARCHAR(255),
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mosques_slug ON mosques(slug);
CREATE INDEX IF NOT EXISTS idx_admins_mosque_id ON admins(mosque_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_mosque_id ON committee_members(mosque_id);
CREATE INDEX IF NOT EXISTS idx_announcements_mosque_id ON announcements(mosque_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(mosque_id, is_active);
CREATE INDEX IF NOT EXISTS idx_events_mosque_id ON events(mosque_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(mosque_id, event_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- MOSQUES POLICIES
-- Public can view published mosques
CREATE POLICY "Public can view published mosques" ON mosques
  FOR SELECT USING (is_published = true);

-- Admins can view their own mosque (even unpublished)
CREATE POLICY "Admins can view own mosque" ON mosques
  FOR SELECT USING (
    id IN (SELECT mosque_id FROM admins WHERE id = auth.uid())
  );

-- Admins can update their own mosque
CREATE POLICY "Admins can update own mosque" ON mosques
  FOR UPDATE USING (
    id IN (SELECT mosque_id FROM admins WHERE id = auth.uid())
  );

-- ADMINS POLICIES
-- Admins can view their own record
CREATE POLICY "Admins can view own record" ON admins
  FOR SELECT USING (id = auth.uid());

-- Admins can update their own record
CREATE POLICY "Admins can update own record" ON admins
  FOR UPDATE USING (id = auth.uid());

-- COMMITTEE MEMBERS POLICIES
-- Public can view committee members of published mosques
CREATE POLICY "Public can view committee members" ON committee_members
  FOR SELECT USING (
    mosque_id IN (SELECT id FROM mosques WHERE is_published = true)
  );

-- Admins can manage committee members of their mosque
CREATE POLICY "Admins can manage committee members" ON committee_members
  FOR ALL USING (
    mosque_id IN (SELECT mosque_id FROM admins WHERE id = auth.uid())
  );

-- ANNOUNCEMENTS POLICIES
-- Public can view active announcements of published mosques
CREATE POLICY "Public can view active announcements" ON announcements
  FOR SELECT USING (
    is_active = true AND
    (expiry_date IS NULL OR expiry_date >= CURRENT_DATE) AND
    mosque_id IN (SELECT id FROM mosques WHERE is_published = true)
  );

-- Admins can manage announcements of their mosque
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    mosque_id IN (SELECT mosque_id FROM admins WHERE id = auth.uid())
  );

-- EVENTS POLICIES
-- Public can view published events of published mosques
CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (
    is_published = true AND
    mosque_id IN (SELECT id FROM mosques WHERE is_published = true)
  );

-- Admins can manage events of their mosque
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    mosque_id IN (SELECT mosque_id FROM admins WHERE id = auth.uid())
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for mosques updated_at
CREATE TRIGGER update_mosques_updated_at
  BEFORE UPDATE ON mosques
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SERVICE ROLE POLICIES (for signup flow)
-- ============================================

-- Allow service role to insert mosques and admins during signup
CREATE POLICY "Service role can insert mosques" ON mosques
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can insert admins" ON admins
  FOR INSERT WITH CHECK (true);
