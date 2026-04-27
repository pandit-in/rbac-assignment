import { Router } from "express"
import { requireRole, type AuthRequest } from "../middleware/auth.js"
import * as userController from "../../controllers/user-controller.js"

const router = Router()

// Get all users (admin only)
router.get("/", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
    const sortBy = req.query.sortBy as string | undefined
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc"

    const result = await userController.getAllUsers(
      limit,
      offset,
      sortBy,
      sortOrder
    )
    res.json(result)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get user by ID (admin or self)
router.get("/:id", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id as string

    // Check if admin or requesting own data
    if (req.user?.role !== "admin" && req.user?.id !== userId) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const user = await userController.getUserWithRatings(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Delete user (admin only)
router.delete("/:id", requireRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id as string

    // Prevent admin from deleting themselves
    if (req.user?.id === userId) {
      return res.status(400).json({ error: "Cannot delete yourself" })
    }

    await userController.deleteUser(userId)
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

export default router
