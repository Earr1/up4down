-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Create storage policies for thumbnail uploads
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins can delete thumbnails"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);