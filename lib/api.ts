import {
  getAllStores,
  getStoreById,
  createStore as createStoreAction,
  deleteStore as deleteStoreAction,
  updateStore as updateStoreAction,
} from "@/app/actions/store"
import { createRating, updateRating, getStoreMetrics, getRatingsByStore } from "@/app/actions/rating"
import { getAllUsers, deleteUser as deleteUserAction } from "@/app/actions/user"
import { getStoreWithRatings } from "@/app/actions/store"

// Fetcher for SWR - we'll adapt it to use server actions
export async function fetcher<T>(url: string): Promise<T> {
  if (url === "/api/stores" || url === "stores") {
    return (await getAllStores()) as T
  }
  if (url === "/api/users" || url === "users") {
    return (await getAllUsers()) as T
  }
  if (url.startsWith("/api/stores/")) {
    const parts = url.split("/")
    const id = parts[3] // /api/stores/[id]
    const subRoute = parts[4] // metrics or other

    if (id) {
      if (subRoute === "metrics") {
        return (await getStoreMetrics(id)) as T
      }
      return (await getStoreWithRatings(id)) as T
    }
  }
  if (url.startsWith("/api/ratings/store/")) {
    const id = url.split("/").pop()
    if (id) return (await getRatingsByStore(id)) as T
  }
  if (url.startsWith("/api/admin/dashboard")) {
    const storesRes = await getAllStores(100, 0)
    const usersRes = await getAllUsers()

    const userBreakdown = {
      users: usersRes.users.filter((u) => u.role === "user").length,
      storeOwners: usersRes.users.filter((u) => u.role === "store_owner")
        .length,
      admins: usersRes.users.filter((u) => u.role === "admin").length,
    }

    const totalRatings = storesRes.data.reduce(
      (acc, s) => acc + (s.totalRatings || 0),
      0
    )
    const averageRating =
      storesRes.data.length > 0
        ? storesRes.data.reduce((acc, s) => acc + (s.averageRating || 0), 0) /
          storesRes.data.length
        : 0

    return {
      totalUsers: usersRes.total,
      userBreakdown,
      totalStores: storesRes.total,
      totalRatings,
      averageRating,
    } as T
  }
  throw new Error(`Fetcher not implemented for URL: ${url}`)
}

export const fetchStores = async () => {
  const result = await getAllStores()
  return result.data || []
}

export const fetchStoreById = async (id: string) => {
  return await getStoreById(id)
}

export const fetchUsers = async () => {
  const result = await getAllUsers()
  return result.users || []
}

export const deleteStore = async (id: string) => {
  return await deleteStoreAction(id)
}

export const deleteUser = async (id: string) => {
  return await deleteUserAction(id)
}

export const createStore = async (data: {
  name: string
  address: string
  description?: string
  ownerId?: string
}) => {
  return await createStoreAction(data)
}

export const submitRating = async ({
  ratingId,
  storeId,
  rating,
  review,
}: {
  ratingId?: number
  storeId?: string
  rating: number
  review?: string
}) => {
  if (ratingId) {
    return await updateRating(ratingId, { rating, review })
  } else if (storeId) {
    return await createRating({ storeId, rating, review })
  }
  throw new Error("Missing ratingId or storeId")
}

export const fetchDashboard = async () => {
  const stores = await getAllStores(100, 0)
  const users = await getAllUsers()
  return {
    totalStores: stores.total,
    totalUsers: users.total,
  }
}

export const updateStore = async (
  id: string,
  data: Partial<{ name: string; address: string; description: string }>
) => {
  return await updateStoreAction(id, data)
}

// Backward compatibility object
export const api = {
  get: async (url: string) => fetcher(url),
  post: async (url: string, data: unknown) => {
    if (url === "/api/stores")
      return createStore(
        data as {
          name: string
          address: string
          description?: string
          ownerId?: string
        }
      )
    if (url === "/api/ratings")
      return submitRating(
        data as {
          ratingId?: number
          storeId?: string
          rating: number
          review?: string
        }
      )
    throw new Error(`POST not implemented for ${url}`)
  },
  patch: async (url: string, data: unknown) => {
    if (url.startsWith("/api/stores/")) {
      const id = url.split("/").pop()
      if (id)
        return updateStore(
          id,
          data as Partial<{
            name: string
            address: string
            description: string
          }>
        )
    }
    throw new Error(`PATCH not implemented for ${url}`)
  },
  put: async (url: string, data: unknown) => {
    if (url.startsWith("/api/stores/")) {
      const id = url.split("/").pop()
      if (id)
        return updateStore(
          id,
          data as Partial<{
            name: string
            address: string
            description: string
          }>
        )
    }
    throw new Error(`PUT not implemented for ${url}`)
  },
  delete: async (url: string) => {
    if (url.startsWith("/api/stores/")) {
      const id = url.split("/").pop()
      if (id) return deleteStore(id)
    }
    if (url.startsWith("/api/users/")) {
      const id = url.split("/").pop()
      if (id) return deleteUser(id)
    }
    throw new Error(`DELETE not implemented for ${url}`)
  },
}
