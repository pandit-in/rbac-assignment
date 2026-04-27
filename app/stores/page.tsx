"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { fetcher, submitRating } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

import { RatingStars } from "@/components/rating-stars"
import { toast } from "sonner"

interface Store {
  id: string
  name: string
  address: string
  ownerId: string
  ownerEmail?: string
  description?: string
  averageRating?: number
  userRating?: number
  createdAt: string
}

export default function StoresPage() {
  const router = useRouter()
  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession()
  const user = session?.user
  const isAuthenticated = !sessionError && !!user
  const [search, setSearch] = useState("")

  const {
    data: storesData,
    error: storesError,
    mutate,
  } = useSWR<{ data: Store[] }>(isAuthenticated ? "/api/stores" : null, fetcher)

  const stores: Store[] = storesData?.data || []
  const isLoadingStores = !storesData && !storesError && isAuthenticated

  useEffect(() => {
    if (!isSessionPending && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isAuthenticated, isSessionPending, router])

  const handleQuickRate = async (storeId: string, rating: number) => {
    try {
      await submitRating({ storeId, rating })
      toast.success("Rating submitted!")
      mutate()
    } catch (err) {
      toast.error((err as Error).message || "Failed to submit rating")
    }
  }

  if (isSessionPending || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const filteredStores = stores.filter(
    (store: Store) =>
      (store.name?.toLowerCase() || "").includes(search?.toLowerCase() || "") ||
      (store.address?.toLowerCase() || "").includes(search?.toLowerCase() || "") ||
      (store.ownerEmail?.toLowerCase() || "").includes(search?.toLowerCase() || "")
  )

  return (
    <main className="mt-20 min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Browse Stores
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find and rate your favorite stores
          </p>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoadingStores ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No stores found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="flex flex-col transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{store.name}</CardTitle>
                    {store.averageRating ? (
                      <div className="flex shrink-0 items-center gap-1 text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold text-foreground">
                          {Number(store.averageRating).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        New
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-1">
                    {store.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {store.description && (
                      <p className="text-sm text-muted-foreground">
                        {store.description.substring(0, 60)}
                        {store.description.length > 60 ? "..." : ""}
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>Your Rating</span>
                        {store.userRating && (
                          <span className="font-bold text-primary">
                            Rated {store.userRating}
                          </span>
                        )}
                      </div>
                      <RatingStars
                        rating={store.userRating || 0}
                        onRate={(r) => handleQuickRate(store.id, r)}
                        size="sm"
                      />
                    </div>
                  </div>

                  <Link href={`/stores/${store.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
