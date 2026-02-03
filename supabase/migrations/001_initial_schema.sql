-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('worker', 'admin');
CREATE TYPE report_status AS ENUM ('draft', 'pending_signature', 'completed');
CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'error');
CREATE TYPE photo_type AS ENUM ('before', 'after');
CREATE TYPE moss_level AS ENUM ('low', 'medium', 'high');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status report_status NOT NULL DEFAULT 'draft',
  sync_status sync_status NOT NULL DEFAULT 'synced',
  
  -- Client Info
  client_first_name TEXT NOT NULL,
  client_last_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_latitude DECIMAL(10, 8),
  client_longitude DECIMAL(11, 8),
  
  -- Roof State
  roof_type TEXT NOT NULL,
  roof_surface DECIMAL(10, 2) NOT NULL,
  moss_level moss_level NOT NULL,
  
  -- Comments
  comments TEXT,
  
  -- Signatures
  worker_signature_url TEXT,
  worker_signature_date TIMESTAMPTZ,
  client_signature_url TEXT,
  client_signature_date TIMESTAMPTZ,
  
  -- PDF
  pdf_url TEXT,
  pdf_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type photo_type NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company settings table
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_phone TEXT NOT NULL,
  company_address TEXT NOT NULL,
  logo_url TEXT,
  legal_mentions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reports_worker_id ON reports(worker_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_photos_report_id ON photos(report_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for reports table
CREATE POLICY "Workers can view their own reports"
  ON reports FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Workers can create their own reports"
  ON reports FOR INSERT
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update their own reports"
  ON reports FOR UPDATE
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can delete their own draft reports"
  ON reports FOR DELETE
  USING (worker_id = auth.uid() AND status = 'draft');

-- RLS Policies for photos table
CREATE POLICY "Users can view photos of their reports"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND (reports.worker_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      ))
    )
  );

CREATE POLICY "Users can insert photos to their reports"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND reports.worker_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their reports"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = photos.report_id
      AND reports.worker_id = auth.uid()
    )
  );

-- RLS Policies for company_settings table
CREATE POLICY "Everyone can view company settings"
  ON company_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update company settings"
  ON company_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default company settings
INSERT INTO company_settings (company_name, company_email, company_phone, company_address)
VALUES (
  'GoBo Clean',
  'contact@goboclean.be',
  '+32 471 XX XX XX',
  'Bruxelles, Belgique'
);
