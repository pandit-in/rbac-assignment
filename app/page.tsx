"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()
  const user = data?.user
  const isAuthenticated = !!data?.user
  const isLoading = isPending

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === "admin") {
          router.push("/admin")
        } else if (user.role === "store_owner") {
          router.push("/dashboard")
        } else if (user.role === "user") {
          router.push("/stores")
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center from-background to-secondary/10 px-4">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground md:text-6xl">
            Store Ratings
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover and rate your favorite stores. Share your experiences with
            the community.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push("/signin")}
            className="px-8"
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/signup")}
            className="px-8"
          >
            Create Account
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 border-border pt-8 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Browse Stores</h3>
            <p className="text-sm text-muted-foreground">
              Explore ratings and reviews from the community
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Share Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Rate stores and share your experiences
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Manage Stores</h3>
            <p className="text-sm text-muted-foreground">
              Store owners can track their ratings
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
