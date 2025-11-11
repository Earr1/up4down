import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  count: number;
}

export const RatingDisplay = ({ rating, count }: RatingDisplayProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < fullStars
                  ? "fill-accent text-accent"
                  : i === fullStars && hasHalfStar
                  ? "fill-accent/50 text-accent"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
      <p className="text-sm text-muted-foreground">{count} ratings</p>
    </div>
  );
};
