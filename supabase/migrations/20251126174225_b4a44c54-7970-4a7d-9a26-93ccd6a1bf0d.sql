-- ============================================
-- MASJID MANAGEMENT SYSTEM DATABASE SCHEMA
-- ============================================

-- 1. Create Role Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'bendahara', 'jamaah');

-- 2. Create User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Definer Function for Role Checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create Mosque Profile Table (Single Row)
CREATE TABLE public.mosque_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Masjidku',
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mosque_profile ENABLE ROW LEVEL SECURITY;

-- Insert default mosque profile
INSERT INTO public.mosque_profile (name, address, phone, email, description)
VALUES ('Masjid Al-Amanah', 'Jl. Contoh No. 123, Kota, Indonesia', '+62 812-3456-7890', 'info@masjidku.id', 'Masjid yang rahmatan lil alamin');

-- 6. Create Activities Table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  activity_time TIME,
  location TEXT,
  category TEXT CHECK (category IN ('kajian', 'acara', 'pengajian', 'lainnya')),
  is_recurring BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 7. Create Announcements Table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 8. Create Financial Transactions Table
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- 9. Create Donations Table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name TEXT,
  category TEXT CHECK (category IN ('infaq', 'donasi', 'zakat', 'wakaf')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  payment_proof_url TEXT,
  status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 10. Create Assets/Inventory Table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  condition TEXT CHECK (condition IN ('baik', 'rusak', 'perlu_perbaikan')),
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  location TEXT,
  notes TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 11. Create Gallery Table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- 12. Create Reports Table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('financial', 'activity', 'asset')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content JSONB,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Mosque Profile Policies (Public read, Admin write)
CREATE POLICY "Everyone can view mosque profile"
  ON public.mosque_profile FOR SELECT
  USING (true);

CREATE POLICY "Admins can update mosque profile"
  ON public.mosque_profile FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Activities Policies
CREATE POLICY "Everyone can view activities"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage activities"
  ON public.activities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Announcements Policies
CREATE POLICY "Everyone can view active announcements"
  ON public.announcements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Financial Transactions Policies
CREATE POLICY "Admins and Bendahara can view transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bendahara')
  );

CREATE POLICY "Admins and Bendahara can manage transactions"
  ON public.financial_transactions FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bendahara')
  );

-- Donations Policies
CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  USING (
    auth.uid() = donor_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bendahara')
  );

CREATE POLICY "Authenticated users can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Bendahara and Admin can update donations"
  ON public.donations FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bendahara')
  );

-- Assets Policies
CREATE POLICY "Everyone can view assets"
  ON public.assets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage assets"
  ON public.assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Gallery Policies
CREATE POLICY "Everyone can view gallery"
  ON public.gallery FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Reports Policies
CREATE POLICY "Everyone can view reports"
  ON public.reports FOR SELECT
  USING (true);

CREATE POLICY "Admins and Bendahara can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bendahara')
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mosque_profile_updated_at
  BEFORE UPDATE ON public.mosque_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Auto-assign 'jamaah' role for Google OAuth users
  IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'jamaah');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();