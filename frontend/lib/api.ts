import axios from "axios"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("neon")
    ? "/api"
    : "http://localhost:3001/api")

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Fetcher for SWR
export const fetcher = (url: string) => api.get(url).then((res) => res.data)

export const fetchStores = async () => {
  const response = await api.get("/api/stores")
  return response.data.data || []
}

export const fetchStoreById = async (id: string) => {
  const response = await api.get(`/api/stores/${id}`)
  return response.data
}

export const fetchUsers = async () => {
  const response = await api.get("/api/users")
  return response.data.users || []
}

export const deleteStore = async (id: string) => {
  const response = await api.delete(`/api/stores/${id}`)
  return response.data
}

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/api/users/${id}`)
  return response.data
}

export const createStore = async (data: {
  name: string
  address: string
  description?: string
}) => {
  const response = await api.post("/api/stores", data)
  return response.data
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
  const url = ratingId ? `/api/ratings/${ratingId}` : "/api/ratings"
  const method = ratingId ? "put" : "post"

  const response = await api[method](url, {
    ...(method === "post" && { storeId }),
    rating,
    review,
  })

  return response.data
}

export const fetchDashboard = async () => {
  const response = await api.get("/api/admin/dashboard")
  return response.data
}
