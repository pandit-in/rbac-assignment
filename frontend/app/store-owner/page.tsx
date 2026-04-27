"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Star, Users, Store, MapPin } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { DataTable, type Column } from "@/components/data-table"

interface Rating {
  id: string
  rating: number
  review: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface StoreData {
  id: string
  name: string
  address: string
  description: string | null
  totalRatings: number
  averageRating: number
  ratings: Rating[]
}

export default function StoreOwnerDashboard() {
  const {
    data: store,
    error,
    isLoading,
  } = useSWR<StoreData>("/api/stores/me/store", fetcher)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold">Store Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          You don&apos;t seem to have a store assigned to your account.
        </p>
      </div>
    )
  }

  const columns: Column<Rating>[] = [
    {
      header: "User",
      accessor: "user",
      render: (val) => (val as Rating["user"])?.name || "Anonymous",
    },
    {
      header: "Email",
      accessor: "user",
      render: (val) => (val as Rating["user"])?.email || "-",
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (val) => (
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium text-foreground">{val as number}</span>
        </div>
      ),
    },
    {
      header: "Review",
      accessor: "review",
      render: (val) =>
        (val as string) || (
          <span className="text-xs text-muted-foreground italic">
            No review
          </span>
        ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
  ]

  return (
    <div className="container space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and track your store&apos;s performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0 stars</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.totalRatings}</div>
            <p className="text-xs text-muted-foreground">
              Submitted by customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Publicly visible</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {store.name}
          </CardTitle>
          <CardDescription className="mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {store.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {store.description || "No description provided."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          Customer Ratings
        </h2>
        <DataTable columns={columns} data={store.ratings} />
      </div>
    </div>
  )
}
