import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const urlSchema = z.string().url("Must be a valid URL").max(500);
const itemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  category_id: z.string().uuid("Invalid category"),
  file_type: z.string().trim().min(1, "File type is required").max(50),
  file_size: z.string().trim().max(50).optional(),
  version: z.string().trim().max(50).optional(),
  download_url: urlSchema,
  thumbnail_url: z.string().trim().max(500).optional(),
  download_count: z.number().int().min(0).optional(),
  average_rating: z.number().min(0).max(5).optional(),
  rating_count: z.number().int().min(0).optional(),
});

interface Category {
  id: string;
  name: string;
}

interface AdminItemFormProps {
  item?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminItemForm = ({ item, onSuccess, onCancel }: AdminItemFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: item?.title || "",
    description: item?.description || "",
    category_id: item?.category_id || "",
    thumbnail_url: item?.thumbnail_url || "",
    download_url: item?.download_url || "",
    file_type: item?.file_type || "",
    file_size: item?.file_size || "",
    version: item?.version || "",
    featured: item?.featured || false,
    download_count: item?.download_count || 0,
    average_rating: item?.average_rating || 0,
    rating_count: item?.rating_count || 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").order("name");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validation = itemSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from("download_items")
          .update(formData)
          .eq("id", item.id);

        if (error) throw error;
        toast.success("Item updated successfully");
      } else {
        // Create new item
        const { error } = await supabase.from("download_items").insert([formData]);

        if (error) throw error;
        toast.success("Item created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{item ? "Edit" : "Add New"} Download Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_type">File Type *</Label>
            <Input
              id="file_type"
              value={formData.file_type}
              onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              placeholder="e.g., apk, exe, pdf"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          <Input
            id="thumbnail_url"
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="download_url">Download URL (Google Drive, etc.) *</Label>
          <Input
            id="download_url"
            type="url"
            value={formData.download_url}
            onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
            placeholder="https://drive.google.com/..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="file_size">File Size</Label>
            <Input
              id="file_size"
              value={formData.file_size}
              onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
              placeholder="e.g., 25 MB"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 1.0.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Initial Stats (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-4">Set starting download count and ratings for this item</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="download_count">Download Count</Label>
              <Input
                id="download_count"
                type="number"
                min="0"
                value={formData.download_count}
                onChange={(e) => setFormData({ ...formData, download_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_rating">Average Rating (0-5)</Label>
              <Input
                id="average_rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.average_rating}
                onChange={(e) => setFormData({ ...formData, average_rating: parseFloat(e.target.value) || 0 })}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating_count">Rating Count</Label>
              <Input
                id="rating_count"
                type="number"
                min="0"
                value={formData.rating_count}
                onChange={(e) => setFormData({ ...formData, rating_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Saving..." : item ? "Update Item" : "Create Item"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
