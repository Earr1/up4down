import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/RatingDisplay";
import { RatingInput } from "@/components/RatingInput";
import { Download as DownloadIcon, Eye, Star, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  download_url: string;
  file_type: string;
  file_size: string | null;
  version: string | null;
  download_count: number;
  average_rating: number;
  rating_count: number;
  created_at: string;
  category_id: string;
  custom_js?: string | null;
}

interface Category {
  name: string;
}

const Download = () => {
  const { id } = useParams();
  const [item, setItem] = useState<DownloadItem | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    if (!id) return;

    const { data: itemData } = await supabase
      .from("download_items")
      .select("*")
      .eq("id", id)
      .single();

    if (itemData) {
      setItem(itemData);

      const { data: categoryData } = await supabase
        .from("categories")
        .select("name")
        .eq("id", itemData.category_id)
        .single();

      if (categoryData) setCategory(categoryData);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!item) return;

    try {
      await supabase.rpc("increment_download_count", { item_id: item.id });
      
      // Execute custom JavaScript if provided
      if (item.custom_js) {
        try {
          const customFunction = new Function('item', 'window', 'document', item.custom_js);
          customFunction(item, window, document);
        } catch (jsError) {
          console.error("Custom JS execution error:", jsError);
        }
      }
      
      window.open(item.download_url, "_blank");
      toast.success("Download started!");
      
      // Refresh download count
      fetchItem();
    } catch (error) {
      toast.error("Failed to start download");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                  {category && (
                    <Badge variant="secondary">{category.name}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.download_count.toLocaleString()} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {item.average_rating.toFixed(1)} ({item.rating_count} ratings)
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {item.description && (
                  <div className="pt-4 border-t">
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4">Rate this download</h2>
              <RatingInput itemId={item.id} onRatingSubmit={fetchItem} />
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 sticky top-4">
              <Button
                onClick={handleDownload}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
                size="lg"
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download Now
              </Button>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Type</span>
                  <span className="font-medium">{item.file_type.toUpperCase()}</span>
                </div>
                {item.file_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{item.file_size}</span>
                  </div>
                )}
                {item.version && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{item.version}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <RatingDisplay rating={item.average_rating} count={item.rating_count} />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Download;
