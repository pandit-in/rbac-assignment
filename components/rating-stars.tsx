"use client"

import { Star } from "lucide-react"

interface RatingStarsProps {
  rating: number
  onRate?: (rating: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function RatingStars({
  rating,
  onRate,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRate && onRate(star)}
          disabled={readOnly}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
