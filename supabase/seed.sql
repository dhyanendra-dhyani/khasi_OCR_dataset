-- ============================================================
-- Khasi OCR Platform — Seed Data
-- ============================================================
-- Run after schema.sql and rls_policies.sql
-- Note: Real users are created via Supabase Auth. This seed data
-- is for testing after creating users through the signup flow.

-- System settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('min_image_width', '300', 'Minimum image width in pixels'),
  ('min_image_height', '300', 'Minimum image height in pixels'),
  ('max_file_size_mb', '20', 'Maximum file size in MB'),
  ('allowed_file_types', '["image/jpeg","image/png","image/webp"]', 'Allowed MIME types'),
  ('platform_announcement', '""', 'Current platform announcement'),
  ('categories', '["textbook_scan","notice_scan","pamphlet_scan","newspaper_scan","form_scan","register_scan","archive_scan","photocopy_scan","worksheet_scan","church_bulletin_scan","community_document_scan","other_printed_scan"]', 'Available dataset categories'),
  ('required_categories_targets', '{"textbook_scan":500,"notice_scan":200,"pamphlet_scan":200,"newspaper_scan":300,"form_scan":200,"register_scan":150,"archive_scan":200,"photocopy_scan":150,"worksheet_scan":150,"church_bulletin_scan":100,"community_document_scan":100,"other_printed_scan":100}', 'Target counts per category for data gap analysis');

-- Sample test data instructions:
-- 1. Create users via the signup page
-- 2. Use Supabase dashboard to set role to 'super_admin' for the first user:
--    UPDATE public.profiles SET role = 'super_admin', status = 'active' WHERE email = 'admin@example.com';
-- 3. Use Supabase dashboard to set role to 'reviewer' for review test users:
--    UPDATE public.profiles SET role = 'reviewer', status = 'active' WHERE email = 'reviewer@example.com';
-- 4. Approve contributor accounts via admin dashboard or SQL:
--    UPDATE public.profiles SET status = 'active' WHERE email = 'contributor@example.com';
