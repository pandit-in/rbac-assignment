import axios from "axios"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:3001/api"
    return baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`
  }
  
  if (typeof window !== "undefined" && window.location.origin.includes("neon")) {
    return "/api"
  }
  
  return "http://localhost:3001/api"
}

const API_URL = getBaseUrl()

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Fetcher for SWR
export const fetcher = (url: string) => {
  const cleanUrl = url.startsWith("/api") ? url.replace(/^\/api/, "") : url
  return api.get(cleanUrl).then((res) => res.data)
}

export const fetchStores = async () => {
  const response = await api.get("/stores")
  return response.data.data || []
}

export const fetchStoreById = async (id: string) => {
  const response = await api.get(`/stores/${id}`)
  return response.data
}

export const fetchUsers = async () => {
  const response = await api.get("/users")
  return response.data.users || []
}

export const deleteStore = async (id: string) => {
  const response = await api.delete(`/stores/${id}`)
  return response.data
}

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

export const createStore = async (data: {
  name: string
  address: string
  description?: string
}) => {
  const response = await api.post("/stores", data)
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
  const url = ratingId ? `/ratings/${ratingId}` : "/ratings"
  const method = ratingId ? "put" : "post"

  const response = await api[method](url, {
    ...(method === "post" && { storeId }),
    rating,
    review,
  })

  return response.data
}

export const fetchDashboard = async () => {
  const response = await api.get("/admin/dashboard")
  return response.data
}
