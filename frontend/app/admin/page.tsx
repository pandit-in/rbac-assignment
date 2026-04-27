"use client"

import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Users, Store, Star } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"
import { KPICard } from "@/components/kpi-card"
import { fetcher } from "@/lib/api"

interface DashboardData {
  totalUsers: number
  userBreakdown: {
    users: number
    storeOwners: number
    admins: number
  }
  totalStores: number
  totalRatings: number
  averageRating: number
}

export default function AdminDashboard() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const isAdmin = session?.user?.role === "admin"

  const { data: dashboard, isLoading } = useSWR<DashboardData>(
    isAdmin ? "/api/admin/dashboard" : null,
    fetcher
  )

  if (isSessionPending) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>Unauthorized</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage users, stores, and view system metrics
        </p>
      </div>

      {dashboard && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <KPICard
              title="Total Users"
              value={dashboard.totalUsers}
              icon={<Users className="h-4 w-4" />}
              description={`${dashboard.userBreakdown.users} users, ${dashboard.userBreakdown.storeOwners} owners`}
            />
            <KPICard
              title="Total Stores"
              value={dashboard.totalStores}
              icon={<Store className="h-4 w-4" />}
              description="Active stores"
            />
            <KPICard
              title="Total Ratings"
              value={dashboard.totalRatings}
              icon={<Star className="h-4 w-4" />}
              description="Community reviews"
            />
            <KPICard
              title="Avg Rating"
              value={dashboard.averageRating.toFixed(1)}
              icon={<Star className="h-4 w-4" />}
              description="Out of 5 stars"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">User Management</h2>
              <p className="mb-4 text-muted-foreground">
                Manage system users, view details, and remove users if needed.
              </p>
              <Link href="/admin/users">
                <Button className="w-full">View Users</Button>
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Store Management</h2>
              <p className="mb-4 text-muted-foreground">
                View all stores, manage store information, and monitor ratings.
              </p>
              <Link href="/admin/stores">
                <Button className="w-full">View Stores</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
