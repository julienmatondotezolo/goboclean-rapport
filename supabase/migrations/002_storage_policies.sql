-- Create storage bucket for roof photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('roof-photos', 'roof-photos', false);

-- Storage policies for roof-photos bucket
CREATE POLICY "Users can upload photos to their reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'roof-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM reports WHERE worker_id = auth.uid()
  )
);

CREATE POLICY "Users can view photos from their reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'roof-photos' AND
  auth.role() = 'authenticated' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM reports WHERE worker_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can delete photos from their draft reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'roof-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM reports 
    WHERE worker_id = auth.uid() AND status = 'draft'
  )
);

-- Create storage bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false);

-- Storage policies for signatures bucket
CREATE POLICY "Users can upload signatures to their reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signatures' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM reports WHERE worker_id = auth.uid()
  )
);

CREATE POLICY "Users can view signatures from their reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signatures' AND
  auth.role() = 'authenticated' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM reports WHERE worker_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false);

-- Storage policies for PDFs bucket
CREATE POLICY "Backend can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' AND
  auth.role() = 'service_role'
);

CREATE POLICY "Users can view PDFs from their reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs' AND
  auth.role() = 'authenticated' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM reports WHERE worker_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Create storage bucket for company assets (logo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true);

-- Storage policies for company-assets bucket
CREATE POLICY "Everyone can view company assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

CREATE POLICY "Only admins can upload company assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-assets' AND
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
