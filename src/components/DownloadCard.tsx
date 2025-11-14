import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Star, Eye } from "lucide-react";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_type: string;
  download_count: number;
  average_rating: number;
  rating_count: number;
}

interface DownloadCardProps {
  item: DownloadItem;
}

export const DownloadCard = ({ item }: DownloadCardProps) => {
  return (
    <Link to={`/download/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 h-full group">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {item.thumbnail_url ? (
            <img
              src={(() => {
                try {
                  const urls = JSON.parse(item.thumbnail_url);
                  return Array.isArray(urls) && urls.length > 0 ? urls[0] : item.thumbnail_url;
                } catch {
                  return item.thumbnail_url;
                }
              })()}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Download className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
            {item.file_type.toUpperCase()}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-semibold line-clamp-1 group-hover:text-accent transition-colors">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {item.download_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {item.average_rating.toFixed(1)} ({item.rating_count})
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
