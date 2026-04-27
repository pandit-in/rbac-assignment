import { Router } from "express"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import * as storeController from "../../controllers/store-controller"
import * as ratingController from "../../controllers/rating-controller"

const router = Router()

// Get all stores (public)
router.get("/", async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
    const search = req.query.search as string | undefined

    const result = await storeController.getAllStores(
      limit,
      offset,
      search,
      req.user?.id
    )
    res.json(result)
  } catch (error) {
    console.error("Error fetching stores:", error)
    res.status(500).json({ error: "Failed to fetch stores" })
  }
})

// Create store (store_owner or admin)
router.post(
  "/",
  requireRole(["store_owner", "admin"]),
  async (req: AuthRequest, res) => {
    try {
      const { name, address, description, ownerId } = req.body

      if (!name || !address) {
        return res.status(400).json({ error: "Name and address are required" })
      }

      // If admin, they can specify an ownerId. Otherwise, use current user id.
      const targetOwnerId =
        req.user?.role === "admin" && ownerId ? ownerId : req.user!.id

      const store = await storeController.createStore(
        targetOwnerId,
        name,
        address,
        description
      )
      res.status(201).json(store)
    } catch (error) {
      console.error("Error creating store:", error)
      res.status(500).json({ error: "Failed to create store" })
    }
  }
)

// Get store by ID with ratings (public)
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const storeId = req.params.id as string

    const store = await storeController.getStoreWithRatings(storeId)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    res.json(store)
  } catch (error) {
    console.error("Error fetching store:", error)
    res.status(500).json({ error: "Failed to fetch store" })
  }
})

// Update store (owner or admin)
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const storeId = req.params.id as string
    const { name, address, description } = req.body

    const store = await storeController.getStoreById(storeId)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    // Check ownership
    if (req.user?.role !== "admin" && req.user?.id !== store.ownerId) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const updated = await storeController.updateStore(storeId, {
      name,
      address,
      description,
    })

    res.json(updated)
  } catch (error) {
    console.error("Error updating store:", error)
    res.status(500).json({ error: "Failed to update store" })
  }
})

// Delete store (owner or admin)
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const storeId = req.params.id as string
    const store = await storeController.getStoreById(storeId)

    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    // Check ownership
    if (req.user?.role !== "admin" && req.user?.id !== store.ownerId) {
      return res.status(403).json({ error: "Forbidden" })
    }

    await storeController.deleteStore(storeId)
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting store:", error)
    res.status(500).json({ error: "Failed to delete store" })
  }
})

// Get store metrics
router.get("/:id/metrics", async (req: AuthRequest, res) => {
  try {
    const storeId = req.params.id as string
    const metrics = await ratingController.getStoreMetrics(storeId)
    res.json(metrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)
    res.status(500).json({ error: "Failed to fetch metrics" })
  }
})

// Get store owned by current user
router.get("/me/store", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "store_owner" && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only store owners can access this" })
    }

    const store = await storeController.getStoreWithRatingsByOwnerId(
      req.user!.id
    )

    if (!store) {
      return res.status(404).json({ error: "No store found for this owner" })
    }

    res.json(store)
  } catch (error) {
    console.error("Error fetching owner store:", error)
    res.status(500).json({ error: "Failed to fetch store" })
  }
})

export default router
