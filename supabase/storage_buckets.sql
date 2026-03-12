-- ============================================================
-- Khasi OCR Platform — Storage Bucket Setup
-- ============================================================
-- Run in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public) VALUES ('raw-pages', 'raw-pages', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('previews', 'previews', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('line-crops', 'line-crops', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for raw-pages bucket
CREATE POLICY "Contributors can upload to raw-pages" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'raw-pages' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Contributors can view own raw-pages" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'raw-pages' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','reviewer'))
    )
  );

-- Storage policies for previews bucket
CREATE POLICY "Contributors can upload previews" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'previews' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone authenticated can view previews" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'previews' AND auth.uid() IS NOT NULL
  );

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage policies for exports bucket
CREATE POLICY "Admins can manage exports" ON storage.objects
  FOR ALL USING (
    bucket_id = 'exports' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin')
    )
  );

-- Storage policies for line-crops bucket
CREATE POLICY "Admins can manage line-crops" ON storage.objects
  FOR ALL USING (
    bucket_id = 'line-crops' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','reviewer')
    )
  );
