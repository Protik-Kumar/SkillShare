import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewsCount?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showNumber = true,
  reviewsCount,
  interactive = false,
  onRate,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const starVal = i + 1;
          const isFilled = rating >= starVal;
          const isHalf = !isFilled && rating >= starVal - 0.5;

          return (
            <button
              type="button"
              key={i}
              disabled={!interactive}
              onClick={() => interactive && onRate?.(starVal)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
              aria-label={`Rate ${starVal} stars`}
            >
              <Star
                className={`${iconSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm ml-0.5">
          {rating ? rating.toFixed(1) : '5.0'}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
