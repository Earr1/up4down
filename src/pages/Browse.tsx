import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { DownloadCard } from "@/components/DownloadCard";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

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

const Browse = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    
    if (selectedCategories.length > 0) {
      // Get category IDs from slugs
      const selectedCats = categories.filter(c => selectedCategories.includes(c.slug));
      const categoryIds = selectedCats.map(c => c.id);

      if (categoryIds.length > 0) {
        // Get items with any of these categories from junction table
        const { data: itemCategories } = await supabase
          .from("download_item_categories")
          .select("item_id")
          .in("category_id", categoryIds);

        if (itemCategories) {
          const itemIds = [...new Set(itemCategories.map(ic => ic.item_id))];
          const { data } = await supabase
            .from("download_items")
            .select("*, download_item_categories!inner(category_id)")
            .in("id", itemIds)
            .order("created_at", { ascending: false });

          if (data) setItems(data);
        }
      }
    } else {
      // Get all items
      const { data } = await supabase
        .from("download_items")
        .select("*, download_item_categories(category_id)")
        .order("created_at", { ascending: false });

      if (data) setItems(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Downloads</h1>
          <p className="text-muted-foreground">Explore our collection of files</p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectCategories={setSelectedCategories}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <DownloadCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground text-lg">No items found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
