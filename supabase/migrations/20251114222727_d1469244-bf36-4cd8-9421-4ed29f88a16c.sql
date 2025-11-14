-- Create junction table for many-to-many relationship between items and categories
CREATE TABLE public.download_item_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.download_items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, category_id)
);

-- Enable RLS on the new table
ALTER TABLE public.download_item_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for the junction table
CREATE POLICY "Item categories are viewable by everyone"
  ON public.download_item_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert item categories"
  ON public.download_item_categories
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete item categories"
  ON public.download_item_categories
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing category relationships to the new table
INSERT INTO public.download_item_categories (item_id, category_id)
SELECT id, category_id
FROM public.download_items
WHERE category_id IS NOT NULL;

-- Drop the old category_id column from download_items
ALTER TABLE public.download_items DROP COLUMN category_id;