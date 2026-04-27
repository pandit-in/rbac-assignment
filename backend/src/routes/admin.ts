import { Router } from "express"
import { requireRole } from "../middleware/auth"
import { db } from "../db"
import type { AuthRequest } from "../middleware/auth"
import { user as users, store as stores, rating } from "../db/schema"

const router = Router()

// Get dashboard metrics (admin only)
router.get(
  "/dashboard",
  requireRole(["admin"]),
  async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users).execute()
      const allStores = await db.select().from(stores).execute()
      const allRatings = await db.select().from(rating).execute()

      const normalUsers = allUsers.filter((u) => u.role === "user").length
      const storeOwners = allUsers.filter(
        (u) => u.role === "store_owner"
      ).length
      const admins = allUsers.filter((u) => u.role === "admin").length

      const avgRating =
        allRatings.length > 0
          ? parseFloat(
              (
                allRatings.reduce((sum, r) => sum + r.rating, 0) /
                allRatings.length
              ).toFixed(2)
            )
          : 0

      res.json({
        totalUsers: allUsers.length,
        userBreakdown: {
          users: normalUsers,
          storeOwners,
          admins,
        },
        totalStores: allStores.length,
        totalRatings: allRatings.length,
        averageRating: avgRating,
      })
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      res.status(500).json({ error: "Failed to fetch dashboard" })
    }
  }
)

export default router
