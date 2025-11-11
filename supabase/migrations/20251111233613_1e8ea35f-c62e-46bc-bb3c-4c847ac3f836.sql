-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create download_items table
CREATE TABLE public.download_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  download_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  version TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.download_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_identifier)
);

-- Create admin_users table for simple password auth
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (false); -- Will be managed via admin panel

CREATE POLICY "Only admins can update categories"
  ON public.categories FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete categories"
  ON public.categories FOR DELETE
  USING (false);

-- RLS Policies for download_items (public read)
CREATE POLICY "Download items are viewable by everyone"
  ON public.download_items FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert items"
  ON public.download_items FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only admins can update items"
  ON public.download_items FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete items"
  ON public.download_items FOR DELETE
  USING (false);

-- RLS Policies for ratings (public read and insert)
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admin_users (restricted)
CREATE POLICY "Admin users are not publicly viewable"
  ON public.admin_users FOR SELECT
  USING (false);

-- Insert default admin user (password: @f33ri)
-- Using a simple bcrypt-like hash for demo (in production, use proper hashing)
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', '@f33ri'); -- Note: In production, this should be properly hashed

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Apps & APK', 'apps-apk', 'Smartphone'),
  ('Software', 'software', 'Monitor'),
  ('Games', 'games', 'Gamepad2'),
  ('Videos', 'videos', 'Video'),
  ('Documents', 'documents', 'FileText'),
  ('Code', 'code', 'Code'),
  ('Windows', 'windows', 'Windows'),
  ('Mac', 'mac', 'Apple');

-- Function to update download count
CREATE OR REPLACE FUNCTION increment_download_count(item_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.download_items
  SET download_count = download_count + 1
  WHERE id = item_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_item_rating(item_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.download_items
  SET 
    average_rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM public.ratings WHERE item_id = item_uuid),
    rating_count = (SELECT COUNT(*) FROM public.ratings WHERE item_id = item_uuid)
  WHERE id = item_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update ratings after insert
CREATE OR REPLACE FUNCTION trigger_update_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_item_rating(NEW.item_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_rating_insert
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_update_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for download_items updated_at
CREATE TRIGGER update_download_items_updated_at
BEFORE UPDATE ON public.download_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();