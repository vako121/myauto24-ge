ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_fuel_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_fuel_check
  CHECK (fuel IN ('ბენზინი', 'დიზელი', 'ჰიბრიდი', 'ელექტრო', 'თხევადი გაზი', 'ბუნებრივი გაზი'));
