"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { fetcher, submitRating } from "@/lib/api"
import { RatingStars } from "@/components/rating-stars"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"

interface Rating {
  id: number
  rating: number
  review?: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

interface StoreDetail {
  id: string
  name: string
  address: string
  description?: string
  averageRating: number
  totalRatings: number
  ratings: Rating[]
}

export default function StoreDetailPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const [formData, setFormData] = useState({
    rating: 0,
    review: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: store,
    error: storeError,
    mutate,
  } = useSWR<StoreDetail>(storeId ? `/api/stores/${storeId}` : null, fetcher)

  const isLoadingStore = !store && !storeError

  const userRating = store?.ratings.find((r) => r.user.id === session?.user?.id)

  const [prevRatingId, setPrevRatingId] = useState<number | undefined>(
    undefined
  )

  // Adjust state during render when userRating changes
  if (userRating && userRating.id !== prevRatingId) {
    setPrevRatingId(userRating.id)
    setFormData({
      rating: userRating.rating,
      review: userRating.review || "",
    })
  }

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/signin")
    }
  }, [isSessionPending, session, router])

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      await submitRating({
        ratingId: userRating?.id,
        storeId,
        rating: formData.rating,
        review: formData.review || undefined,
      })

      mutate() // Re-validate cache
      toast.success(
        userRating
          ? "Rating updated successfully!"
          : "Rating submitted successfully!"
      )
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSessionPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-7" />
      </div>
    )
  }

  return (
    <main className="mt-20 min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/stores"
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Link>

        {isLoadingStore ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : store ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">{store.name}</CardTitle>
                  <CardDescription>{store.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {store.description && (
                    <div>
                      <h3 className="mb-2 font-semibold">About</h3>
                      <p className="text-muted-foreground">
                        {store.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-4 font-semibold">Rating Summary</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">
                        {store.averageRating.toFixed(1)}
                      </div>
                      <div>
                        <RatingStars
                          rating={Math.round(store.averageRating)}
                          readOnly
                          size="lg"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          {store.totalRatings}{" "}
                          {store.totalRatings === 1 ? "rating" : "ratings"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {store.ratings && store.ratings.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-semibold">Recent Reviews</h3>
                      <div className="space-y-4">
                        {store.ratings.slice(0, 5).map((rating) => (
                          <Card key={rating.id} className="bg-muted/50">
                            <CardContent className="pt-4">
                              <div className="mb-2 flex items-start justify-between">
                                <RatingStars rating={rating.rating} readOnly />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    rating.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {rating.review && (
                                <p className="text-sm text-muted-foreground">
                                  {rating.review}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {userRating ? "Update Your Rating" : "Rate This Store"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRating} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Your Rating
                      </label>
                      <RatingStars
                        rating={formData.rating}
                        onRate={(rating) =>
                          setFormData((prev) => ({ ...prev, rating }))
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="review"
                        className="mb-2 block text-sm font-medium"
                      >
                        Your Review (Optional)
                      </label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience with this store..."
                        value={formData.review}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            review: e.target.value,
                          }))
                        }
                        className="resize-none"
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || formData.rating === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : userRating ? (
                        "Update Rating"
                      ) : (
                        "Submit Rating"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Store not found</p>
          </div>
        )}
      </div>
    </main>
  )
}
