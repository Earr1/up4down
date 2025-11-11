-- Fix search_path for trigger_update_rating function
DROP FUNCTION IF EXISTS trigger_update_rating() CASCADE;
CREATE OR REPLACE FUNCTION trigger_update_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_item_rating(NEW.item_id);
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_rating();