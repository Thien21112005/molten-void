import { cn } from "../utils/cn";

export interface StarRatingProps {
  stars: number; // 0 to 3
  maxStars?: number; // default 3
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

export function StarRating({
  stars,
  maxStars = 3,
  size = "md",
  className,
  animate = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-11 w-11",
  };

  const starArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {starArray.map((starNum) => {
        const isEarned = starNum <= stars;
        return (
          <div
            key={starNum}
            className={cn(
              "relative transition-transform duration-300",
              animate && isEarned && "animate-pop-in",
            )}
            style={animate ? { animationDelay: `${(starNum - 1) * 160}ms` } : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isEarned ? "#ffb326" : "rgba(255, 255, 255, 0.12)"}
              stroke={isEarned ? "#ffe480" : "rgba(255, 255, 255, 0.25)"}
              strokeWidth="1.2"
              className={cn(
                sizeClasses[size],
                isEarned
                  ? "drop-shadow-[0_0_8px_rgba(255,179,38,0.7)]"
                  : "opacity-40",
              )}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
