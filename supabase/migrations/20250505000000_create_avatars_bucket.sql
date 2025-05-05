
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to avatars
CREATE POLICY "Avatar public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Avatar upload access for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update and delete their own avatars
CREATE POLICY "Avatar update access for authenticated users"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Avatar delete access for authenticated users"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);
