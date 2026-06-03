CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM now())::INTEGER + 1),
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  fuel TEXT NOT NULL CHECK (fuel IN ('ბენზინი', 'დიზელი', 'ჰიბრიდი', 'ელექტრო')),
  transmission TEXT NOT NULL CHECK (transmission IN ('ავტომატიკა', 'მექანიკა')),
  city TEXT NOT NULL,
  engine TEXT NOT NULL,
  drive TEXT NOT NULL CHECK (drive IN ('წინა', 'უკანა', '4x4')),
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vip TEXT CHECK (vip IN ('super', 'vip', 'color')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listings_created_at_idx ON public.listings (created_at DESC);
CREATE INDEX listings_make_idx ON public.listings (make);
CREATE INDEX listings_city_idx ON public.listings (city);
CREATE INDEX listings_user_id_idx ON public.listings (user_id);

GRANT SELECT ON public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('car-photos', 'car-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Car photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-photos');

CREATE POLICY "Authenticated users can upload car photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'car-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own car photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'car-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'car-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own car photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'car-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
