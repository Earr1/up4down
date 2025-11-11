import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatingInputProps {
  itemId: string;
  onRatingSubmit?: () => void;
}

export const RatingInput = ({ itemId, onRatingSubmit }: RatingInputProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    // Use a unique identifier (could be IP-based, session-based, etc.)
    const userIdentifier = `user_${Date.now()}_${Math.random()}`;

    try {
      const { error } = await supabase.from("ratings").insert({
        item_id: itemId,
        rating: rating,
        user_identifier: userIdentifier,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already rated this item");
        } else {
          toast.error("Failed to submit rating");
        }
      } else {
        toast.success("Rating submitted successfully!");
        setRating(0);
        if (onRatingSubmit) onRatingSubmit();
      }
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hoveredRating || rating)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="bg-accent hover:bg-accent/90"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </div>
  );
};
