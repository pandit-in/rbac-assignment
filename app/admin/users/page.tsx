"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Star } from "lucide-react"
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
import { DataTable, type Column } from "@/components/data-table"
import { fetcher, deleteUser } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"

interface User {
  id: string
  email: string
  name: string
  role: string
  address?: string
  createdAt: string
  averageRating?: number | null
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: usersData, error, mutate } = useSWR<{ users: User[] }>("/api/users", fetcher)
  const users: User[] = usersData?.users || []
  const isLoading = !usersData && !error

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteUser(deleteId)
      mutate()
      toast.success("User deleted successfully")
      setDeleteId(null)
    } catch (err) {
      console.log(err)
      toast.error("Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (value) => {
        const name = String(value)
        return name.length > 15 ? name.substring(0, 15) + "..." : name
      },
    },
    { header: "Email", accessor: "email", sortable: true },
    {
      header: "Address",
      accessor: "address",
      sortable: true,
      render: (value) => {
        const address = String(value || "null")
        return address.length > 15 ? address.substring(0, 15) + "..." : address
      },
    },
    {
      header: "Role",
      accessor: "role",
      sortable: true,
      render: (value) => (
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {value as string}
        </span>
      ),
    },
    {
      header: "Rating",
      accessor: "averageRating",
      sortable: true,
      render: (value, user) => {
        if (user.role !== "store_owner") return "-"
        return value ? (
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-medium text-foreground">
              {Number(value).toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No ratings</span>
        )
      },
    },
    {
      header: "Created",
      accessor: "createdAt",
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.address?.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
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
              Users Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage all system users
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users/create">
              <Button>Add User</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <DataTable<User>
        columns={columns}
        data={filteredUsers}
        actions={(user) => (
          <button
            onClick={() => setDeleteId(user.id)}
            className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
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
