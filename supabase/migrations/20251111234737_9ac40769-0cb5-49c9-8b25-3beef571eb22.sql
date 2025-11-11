-- Fix search_path for all functions to address security warnings

-- Drop and recreate increment_download_count with search_path
DROP FUNCTION IF EXISTS increment_download_count(uuid);
CREATE OR REPLACE FUNCTION increment_download_count(item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE download_items
  SET download_count = download_count + 1
  WHERE id = item_id;
END;
$$;

-- Drop and recreate update_item_rating with search_path
DROP FUNCTION IF EXISTS update_item_rating(uuid);
CREATE OR REPLACE FUNCTION update_item_rating(item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
  rating_count integer;
BEGIN
  SELECT AVG(rating)::numeric(3,2), COUNT(*)
  INTO avg_rating, rating_count
  FROM ratings
  WHERE ratings.item_id = update_item_rating.item_id;

  UPDATE download_items
  SET 
    average_rating = COALESCE(avg_rating, 0),
    rating_count = rating_count
  WHERE id = item_id;
END;
$$;

-- Drop and recreate update_updated_at_column with search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_download_items_updated_at
  BEFORE UPDATE ON download_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();