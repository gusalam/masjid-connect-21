-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('gallery', 'gallery', true),
  ('mosque-assets', 'mosque-assets', true);

-- RLS policies for gallery bucket
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);

-- RLS policies for mosque-assets bucket
CREATE POLICY "Public can view mosque assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'mosque-assets');

CREATE POLICY "Admins can upload mosque assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mosque-assets' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can delete mosque assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mosque-assets' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);