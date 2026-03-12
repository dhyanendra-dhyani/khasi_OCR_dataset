-- ============================================================
-- Khasi OCR Platform — Row-Level Security Policies
-- ============================================================
-- Run after schema.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function to get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'reviewer')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_above());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- ============================================================
-- UPLOAD_BATCHES policies
-- ============================================================
CREATE POLICY "Contributors can view own batches" ON public.upload_batches
  FOR SELECT USING (contributor_id = auth.uid());

CREATE POLICY "Contributors can insert own batches" ON public.upload_batches
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "Contributors can update own draft batches" ON public.upload_batches
  FOR UPDATE USING (contributor_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can view all batches" ON public.upload_batches
  FOR SELECT USING (public.is_admin_or_above());

CREATE POLICY "Admins can update any batch" ON public.upload_batches
  FOR UPDATE USING (public.is_admin_or_above());

-- ============================================================
-- RAW_PAGES policies
-- ============================================================
CREATE POLICY "Contributors can view own pages" ON public.raw_pages
  FOR SELECT USING (contributor_id = auth.uid());

CREATE POLICY "Contributors can insert own pages" ON public.raw_pages
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "Contributors can update own draft pages" ON public.raw_pages
  FOR UPDATE USING (contributor_id = auth.uid() AND status = 'draft');

CREATE POLICY "Contributors can delete own draft pages" ON public.raw_pages
  FOR DELETE USING (contributor_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can view all pages" ON public.raw_pages
  FOR SELECT USING (public.is_admin_or_above());

CREATE POLICY "Admins can update any page" ON public.raw_pages
  FOR UPDATE USING (public.is_admin_or_above());

-- ============================================================
-- RAW_PAGE_METADATA policies
-- ============================================================
CREATE POLICY "Contributors can view own metadata" ON public.raw_page_metadata
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.raw_pages WHERE id = raw_page_metadata.page_id AND contributor_id = auth.uid())
  );

CREATE POLICY "Contributors can insert metadata for own pages" ON public.raw_page_metadata
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.raw_pages WHERE id = raw_page_metadata.page_id AND contributor_id = auth.uid())
  );

CREATE POLICY "Contributors can update metadata for own draft pages" ON public.raw_page_metadata
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.raw_pages WHERE id = raw_page_metadata.page_id AND contributor_id = auth.uid() AND status = 'draft')
  );

CREATE POLICY "Admins can manage all metadata" ON public.raw_page_metadata
  FOR ALL USING (public.is_admin_or_above());

-- ============================================================
-- REVIEW_ACTIONS policies
-- ============================================================
CREATE POLICY "Reviewers can insert reviews" ON public.review_actions
  FOR INSERT WITH CHECK (public.is_admin_or_above());

CREATE POLICY "Reviewers can view all reviews" ON public.review_actions
  FOR SELECT USING (public.is_admin_or_above());

CREATE POLICY "Contributors can view reviews on own pages" ON public.review_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.raw_pages WHERE id = review_actions.page_id AND contributor_id = auth.uid())
  );

-- ============================================================
-- QUALITY_FLAGS policies
-- ============================================================
CREATE POLICY "Admins can manage quality flags" ON public.quality_flags
  FOR ALL USING (public.is_admin_or_above());

CREATE POLICY "Contributors can view flags on own pages" ON public.quality_flags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.raw_pages WHERE id = quality_flags.page_id AND contributor_id = auth.uid())
  );

-- ============================================================
-- DETECTION_ANNOTATIONS policies (future use)
-- ============================================================
CREATE POLICY "Admins can manage annotations" ON public.detection_annotations
  FOR ALL USING (public.is_admin_or_above());

-- ============================================================
-- LINE_CROPS policies (future use)
-- ============================================================
CREATE POLICY "Admins can manage line crops" ON public.line_crops
  FOR ALL USING (public.is_admin_or_above());

-- ============================================================
-- RECOGNITION_LABELS policies (future use)
-- ============================================================
CREATE POLICY "Admins can manage labels" ON public.recognition_labels
  FOR ALL USING (public.is_admin_or_above());

-- ============================================================
-- AUDIT_LOGS policies
-- ============================================================
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin_or_above());

CREATE POLICY "Any authenticated user can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- NOTIFICATIONS policies
-- ============================================================
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin_or_above());

-- ============================================================
-- EXPORT_JOBS policies
-- ============================================================
CREATE POLICY "Admins can manage exports" ON public.export_jobs
  FOR ALL USING (public.is_admin_or_above());

-- ============================================================
-- SYSTEM_SETTINGS policies
-- ============================================================
CREATE POLICY "Anyone authenticated can read settings" ON public.system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can update settings" ON public.system_settings
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );
