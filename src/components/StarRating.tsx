import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate
}: StarRatingProps) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= rating;
        const isHalf = !isFilled && starNumber - 0.5 <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(starNumber)}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled || isHalf
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-neutral-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
