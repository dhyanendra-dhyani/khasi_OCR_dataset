-- ============================================================
-- Khasi OCR Platform — Supabase PostgreSQL Schema
-- ============================================================
-- Run this against your Supabase SQL Editor to initialize the DB.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES — extends auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institute TEXT,
  district TEXT,
  state TEXT DEFAULT 'Meghalaya',
  preferred_language TEXT DEFAULT 'English',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('super_admin','admin','reviewer','contributor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  contribution_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. UPLOAD_BATCHES — groups of files uploaded together
-- ============================================================
CREATE TABLE public.upload_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT,
  total_pages INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','rejected','needs_revision','archived')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_batches_contributor ON public.upload_batches(contributor_id);
CREATE INDEX idx_batches_status ON public.upload_batches(status);

-- ============================================================
-- 3. RAW_PAGES — individual uploaded page images
-- ============================================================
CREATE TABLE public.raw_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES public.upload_batches(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  original_file_path TEXT NOT NULL,
  preview_file_path TEXT,
  original_filename TEXT,
  file_size BIGINT,
  file_hash TEXT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  page_number INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','rejected','needs_revision','archived')),
  is_gold BOOLEAN DEFAULT FALSE,
  gold_approved_by UUID REFERENCES public.profiles(id),
  gold_approved_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  reviewer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pages_batch ON public.raw_pages(batch_id);
CREATE INDEX idx_pages_contributor ON public.raw_pages(contributor_id);
CREATE INDEX idx_pages_status ON public.raw_pages(status);
CREATE INDEX idx_pages_category ON public.raw_pages(category);
CREATE INDEX idx_pages_hash ON public.raw_pages(file_hash);
CREATE INDEX idx_pages_gold ON public.raw_pages(is_gold) WHERE is_gold = TRUE;

-- ============================================================
-- 4. RAW_PAGE_METADATA — normalized metadata per page
-- ============================================================
CREATE TABLE public.raw_page_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL UNIQUE REFERENCES public.raw_pages(id) ON DELETE CASCADE,
  document_title TEXT,
  source_type TEXT CHECK (source_type IN ('textbook','notice','pamphlet','newspaper','form','register','archive','photocopy','worksheet','church_bulletin','community_document','other')),
  capture_type TEXT CHECK (capture_type IN ('flatbed_scan','mobile_photo','photocopy_scan','pdf_render','other')),
  language_primary TEXT DEFAULT 'Khasi',
  district TEXT,
  source_institution TEXT,
  document_year INTEGER,
  quality_level TEXT CHECK (quality_level IN ('clean','medium','noisy','very_noisy')),
  blur_present BOOLEAN DEFAULT FALSE,
  shadow_present BOOLEAN DEFAULT FALSE,
  skew_present BOOLEAN DEFAULT FALSE,
  low_contrast BOOLEAN DEFAULT FALSE,
  faded_text BOOLEAN DEFAULT FALSE,
  multi_column BOOLEAN DEFAULT FALSE,
  contains_tables BOOLEAN DEFAULT FALSE,
  contains_stamps BOOLEAN DEFAULT FALSE,
  contains_sensitive_info BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT FALSE,
  contributor_notes TEXT,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_metadata_page ON public.raw_page_metadata(page_id);
CREATE INDEX idx_metadata_source ON public.raw_page_metadata(source_type);
CREATE INDEX idx_metadata_quality ON public.raw_page_metadata(quality_level);

-- ============================================================
-- 5. REVIEW_ACTIONS — every review action taken
-- ============================================================
CREATE TABLE public.review_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.raw_pages(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve','reject','needs_revision','mark_gold','unmark_gold','archive')),
  reason TEXT,
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_page ON public.review_actions(page_id);
CREATE INDEX idx_reviews_reviewer ON public.review_actions(reviewer_id);

-- ============================================================
-- 6. QUALITY_FLAGS — automated/manual quality flags
-- ============================================================
CREATE TABLE public.quality_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.raw_pages(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('duplicate','blurry','low_resolution','empty_page','corrupted','oversized','wrong_format','rotated','other')),
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info','warning','error')),
  details TEXT,
  auto_detected BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_flags_page ON public.quality_flags(page_id);
CREATE INDEX idx_flags_type ON public.quality_flags(flag_type);

-- ============================================================
-- 7. DETECTION_ANNOTATIONS — future text region annotations
-- ============================================================
CREATE TABLE public.detection_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.raw_pages(id) ON DELETE CASCADE,
  annotator_id UUID REFERENCES public.profiles(id),
  annotation_json JSONB DEFAULT '[]',
  annotation_status TEXT DEFAULT 'pending' CHECK (annotation_status IN ('pending','in_progress','completed','reviewed','approved')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_det_page ON public.detection_annotations(page_id);

-- ============================================================
-- 8. LINE_CROPS — cropped text line images (future)
-- ============================================================
CREATE TABLE public.line_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.raw_pages(id) ON DELETE CASCADE,
  crop_image_path TEXT NOT NULL,
  line_text TEXT,
  text_status TEXT DEFAULT 'pending' CHECK (text_status IN ('pending','reviewed','approved')),
  crop_quality TEXT CHECK (crop_quality IN ('good','acceptable','poor')),
  source_bbox JSONB,
  created_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  version INTEGER DEFAULT 1,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crops_page ON public.line_crops(page_id);

-- ============================================================
-- 9. RECOGNITION_LABELS — ground truth labels (future)
-- ============================================================
CREATE TABLE public.recognition_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID NOT NULL REFERENCES public.line_crops(id) ON DELETE CASCADE,
  label_text TEXT NOT NULL,
  confidence FLOAT,
  labeled_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','disputed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. AUDIT_LOGS — comprehensive audit trail
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);

-- ============================================================
-- 11. NOTIFICATIONS — user notifications
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_user ON public.notifications(user_id);
CREATE INDEX idx_notif_read ON public.notifications(read) WHERE read = FALSE;

-- ============================================================
-- 12. EXPORT_JOBS — export task queue
-- ============================================================
CREATE TABLE public.export_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  export_type TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  file_path TEXT,
  record_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- 13. SYSTEM_SETTINGS — admin-configurable settings
-- ============================================================
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'contributor',
    'pending'
  );
  -- Create audit log
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (NEW.id, 'signup', 'profile', NEW.id, jsonb_build_object('email', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_batches_updated BEFORE UPDATE ON public.upload_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_pages_updated BEFORE UPDATE ON public.raw_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_metadata_updated BEFORE UPDATE ON public.raw_page_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_det_updated BEFORE UPDATE ON public.detection_annotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_crops_updated BEFORE UPDATE ON public.line_crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update batch page count
CREATE OR REPLACE FUNCTION public.update_batch_page_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.upload_batches
  SET total_pages = (SELECT COUNT(*) FROM public.raw_pages WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id))
  WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_page_count_insert AFTER INSERT ON public.raw_pages FOR EACH ROW EXECUTE FUNCTION public.update_batch_page_count();
CREATE TRIGGER tr_page_count_delete AFTER DELETE ON public.raw_pages FOR EACH ROW EXECUTE FUNCTION public.update_batch_page_count();
