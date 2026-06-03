ALTER TABLE public.listings
  ADD COLUMN contact_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN contact_phone TEXT NOT NULL DEFAULT '';
