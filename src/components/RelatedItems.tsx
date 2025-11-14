import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DownloadCard } from "@/components/DownloadCard";
import { Loader2 } from "lucide-react";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_type: string;
  download_count: number;
  average_rating: number;
  rating_count: number;
  categories?: { category_id: string }[];
}

interface RelatedItemsProps {
  currentItemId: string;
  categoryIds: string[];
}

export const RelatedItems = ({ currentItemId, categoryIds }: RelatedItemsProps) => {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedItems();
  }, [currentItemId, categoryIds]);

  const fetchRelatedItems = async () => {
    if (categoryIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get items with same categories
    const { data: itemCategories } = await supabase
      .from("download_item_categories")
      .select("item_id")
      .in("category_id", categoryIds)
      .neq("item_id", currentItemId);

    if (itemCategories) {
      const itemIds = [...new Set(itemCategories.map(ic => ic.item_id))];
      
      const { data } = await supabase
        .from("download_items")
        .select("*, download_item_categories(category_id)")
        .in("id", itemIds)
        .limit(4);

      if (data) setItems(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Downloads</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <DownloadCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};