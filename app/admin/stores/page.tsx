"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { DataTable, Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Eye, Plus, Star } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { fetcher, deleteStore } from "@/lib/api"

interface Store {
  id: string
  name: string
  address: string
  ownerId: string
  ownerEmail?: string
  averageRating: number
  userRating?: number
  totalRatings: number
  description?: string
  createdAt: string
}

export default function StoresPage() {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: storesData, error, mutate } = useSWR<{ data: Store[] }>("/api/stores", fetcher)
  const stores: Store[] = storesData?.data || []
  const isLoading = !storesData && !error

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteStore(deleteId)
      mutate()
      toast.success("Store deleted successfully")
      setDeleteId(null)
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete store")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Store>[] = [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (value) => {
        const name = String(value)
        return name.length > 12 ? name.substring(0, 12) + "..." : name
      },
    },
    { header: "Owner Email", accessor: "ownerEmail", sortable: true },
    { header: "Address", accessor: "address", sortable: true },
    { header: "Total Ratings", accessor: "totalRatings", sortable: true },
    {
      header: "My Rating",
      accessor: "userRating",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-primary">
          <Star className={`h-3 w-3 ${value ? "fill-current" : ""}`} />
          <span className="text-xs font-bold text-foreground">
            {value ? Number(value).toFixed(0) : "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: "averageRating",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-3 w-3 fill-current" />
          <span className="text-xs font-medium text-foreground">
            {value ? Number(value).toFixed(1) : "0.0"}
          </span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ]

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase()) ||
      store.ownerEmail?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-7" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Stores Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage all system stores
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Link href="/admin/stores/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Store
            </Button>
          </Link>
        </div>
      </div>

      <DataTable<Store>
        columns={columns}
        data={filteredStores}
        actions={(store) => (
          <div className="flex gap-2">
            <Link href={`/stores/${store.id}`}>
              <button
                className="rounded-md p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                aria-label="View store"
              >
                <Eye className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => setDeleteId(store.id)}
              className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Delete store"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this store? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
