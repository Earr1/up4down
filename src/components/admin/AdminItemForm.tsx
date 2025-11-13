import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item?.thumbnail_url || "");
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
    custom_js: item?.custom_js || "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").order("name");
    if (data) setCategories(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.thumbnail_url;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if selected
      const thumbnailUrl = await uploadImage();
      
      const dataToSave = {
        ...formData,
        thumbnail_url: thumbnailUrl || formData.thumbnail_url,
      };

      // Validate form data
      const validation = itemSchema.safeParse(dataToSave);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from("download_items")
          .update(dataToSave)
          .eq("id", item.id);

        if (error) throw error;
        toast.success("Item updated successfully");
      } else {
        // Create new item
        const { error } = await supabase.from("download_items").insert([dataToSave]);

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
          <Label>Thumbnail Image</Label>
          <div className="space-y-3">
            {imagePreview && (
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setFormData({ ...formData, thumbnail_url: "" });
                  }}
                  className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Image</span>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor="thumbnail_url" className="text-sm text-muted-foreground">Or paste URL</Label>
                <Input
                  id="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnail_url: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
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

        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="featured" className="text-base font-semibold">Featured Item</Label>
              <p className="text-sm text-muted-foreground">Display this item in the featured section on homepage</p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
          </div>
        </div>

        <div className="space-y-2 border-t pt-6">
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

        <div className="space-y-2 border-t pt-6">
          <Label htmlFor="custom_js" className="text-base font-semibold">
            Custom JavaScript (Optional)
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            JavaScript code to execute when download button is clicked. Use for analytics tracking, custom behavior, etc.
          </p>
          <Textarea
            id="custom_js"
            value={formData.custom_js}
            onChange={(e) => setFormData({ ...formData, custom_js: e.target.value })}
            placeholder="// Example: console.log('Download clicked');"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Available variables: <code className="px-1 py-0.5 bg-muted rounded text-xs">item</code>, <code className="px-1 py-0.5 bg-muted rounded text-xs">window</code>, <code className="px-1 py-0.5 bg-muted rounded text-xs">document</code>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading || uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {uploading ? "Uploading..." : loading ? "Saving..." : item ? "Update Item" : "Create Item"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
