"use client"

import { useState, useMemo } from "react"
import { authClient } from "@/lib/auth-client"
import { RatingStars } from "@/components/rating-stars"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Store, Star } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/api"

interface StoreMetrics {
  storeId: number
  totalRatings: number
  averageRating: number
  ratingDistribution: {
    "1": number
    "2": number
    "3": number
    "4": number
    "5": number
  }
}

interface Store {
  id: number
  name: string
  address: string
  description?: string
  averageRating: number
  totalRatings: number
  ownerId: string
}

interface Rating {
  id: number
  rating: number
  review?: string
  userId: string
  userName?: string
  createdAt: string
}

export default function StoreOwnerDashboard() {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Fetch all stores
  const {
    data: storesData,
    isLoading: isStoresLoading,
    error: storesError,
  } = useSWR<{ data: Store[] }>(user ? "/api/stores" : null, fetcher)

  const stores = useMemo(() => {
    if (!storesData?.data || !user) return []
    return storesData.data.filter((s) => s.ownerId === user.id)
  }, [storesData, user])

  // Derive active store: user selection OR first available store
  const activeStore = selectedStore || stores[0] || null

  // Fetch metrics for active store
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useSWR<StoreMetrics>(
    activeStore ? `/api/stores/${activeStore.id}/metrics` : null,
    fetcher
  )

  // Fetch ratings for active store
  const {
    data: ratings,
    isLoading: isRatingsLoading,
    error: ratingsError,
  } = useSWR<Rating[]>(
    activeStore ? `/api/ratings/store/${activeStore.id}` : null,
    fetcher
  )

  const isLoading =
    isStoresLoading || (activeStore && (isMetricsLoading || isRatingsLoading))
  const hasError = storesError || metricsError || ratingsError

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="font-medium text-destructive">
          Failed to load dashboard data
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Stores</h1>
          <p className="mt-2 text-muted-foreground">
            You don&apos;t have any stores yet. Contact an admin to{" "}
            <Link href={"/create"} className="text-primary underline">
              create one
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-20 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Stores</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor your store ratings and reviews
        </p>
      </div>

      {/* Store Selector */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`rounded-lg px-4 py-2 whitespace-nowrap transition-colors ${
                activeStore?.id === store.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {activeStore && metrics && (
        <>
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <KPICard
              title="Total Ratings"
              value={metrics.totalRatings}
              icon={<Star className="h-4 w-4" />}
              description="Community reviews"
            />
            <KPICard
              title="Average Rating"
              value={metrics.averageRating.toFixed(1)}
              icon={<Star className="h-4 w-4" />}
              description="Out of 5 stars"
            />
            <KPICard
              title="Store"
              value={activeStore.name}
              icon={<Store className="h-4 w-4" />}
              description={
                activeStore.address.length > 15
                  ? activeStore.address.substring(0, 15) + "..."
                  : activeStore.address
              }
            />
          </div>

          {/* Rating Distribution */}
          {metrics.totalRatings > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-4">
                    <div className="flex w-20 items-center gap-1">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(metrics.ratingDistribution[String(stars) as keyof typeof metrics.ratingDistribution] / metrics.totalRatings) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {
                        metrics.ratingDistribution[
                          String(
                            stars
                          ) as keyof typeof metrics.ratingDistribution
                        ]
                      }
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {!ratings || ratings.length === 0 ? (
                <p className="text-muted-foreground">No ratings yet</p>
              ) : (
                <div className="space-y-6">
                  {ratings.slice(0, 10).map((rating) => (
                    <div
                      key={rating.id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <RatingStars rating={rating.rating} readOnly />
                          <span className="text-xs font-semibold text-foreground">
                            {rating.userName || "Anonymous"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-sm text-muted-foreground italic">
                          &quot;{rating.review}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
