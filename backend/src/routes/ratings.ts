import { Router } from "express"
import { requireAuth, type AuthRequest } from "../middleware/auth"
import * as ratingController from "../../controllers/rating-controller"

const router = Router()

router.get("/store/:storeId", async (req: AuthRequest, res) => {
  try {
    const storeId = req.params.storeId as string
    const ratings = await ratingController.getRatingsByStore(storeId)
    res.json(ratings)
  } catch (error) {
    console.error("Error fetching ratings:", error)
    res.status(500).json({ error: "Failed to fetch ratings" })
  }
})

// Get user's ratings (authenticated)
router.get("/user/my-ratings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const ratings = await ratingController.getUserRatings(req.user!.id)
    res.json(ratings)
  } catch (error) {
    console.error("Error fetching user ratings:", error)
    res.status(500).json({ error: "Failed to fetch ratings" })
  }
})

// Create or update a rating (authenticated user)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { storeId, rating, review } = req.body

    if (!storeId || rating === undefined) {
      return res.status(400).json({ error: "Store ID and rating are required" })
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5" })
    }

    // Check if user already rated this store
    const existingRating = await ratingController.getRating(
      req.user!.id,
      storeId
    )

    if (existingRating) {
      // Update existing rating
      const updated = await ratingController.updateRating(
        existingRating.id,
        rating,
        review
      )
      return res.json(updated)
    }

    // Create new rating
    const newRating = await ratingController.createRating(
      req.user!.id,
      storeId,
      rating,
      review
    )

    res.status(201).json(newRating)
  } catch (error) {
    console.error("Error submitting rating:", error)
    const message =
      error instanceof Error ? error.message : "Failed to submit rating"
    res.status(400).json({ error: message })
  }
})

// Update a rating (authenticated, own rating only)
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const ratingId = parseInt(req.params.id as string)
    const { rating, review } = req.body as {
      rating: number
      review: string
    }
    const updated = await ratingController.updateRating(
      ratingId,
      rating,
      review
    )

    if (!updated) {
      return res.status(404).json({ error: "Rating not found" })
    }

    res.json(updated)
  } catch (error) {
    console.error("Error updating rating:", error)
    const message =
      error instanceof Error ? error.message : "Failed to update rating"
    res.status(400).json({ error: message })
  }
})

// Delete a rating (authenticated, own rating only)
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const ratingId = parseInt(req.params.id as string)
    await ratingController.deleteRating(ratingId)
    res.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete rating"
    res.status(400).json({ error: message })
  }
})

export default router
