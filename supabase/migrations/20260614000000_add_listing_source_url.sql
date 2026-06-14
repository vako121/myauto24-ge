ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS source_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_source_url_key'
      AND conrelid = 'public.listings'::regclass
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_source_url_key UNIQUE (source_url);
  END IF;
END $$;
