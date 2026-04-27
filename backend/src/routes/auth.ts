import { Router } from "express"
import type { Request, Response } from "express"

const router = Router()

// Placeholder endpoints - These will be handled by better-auth middleware
// The actual auth handler is mounted at /auth in server.ts

// Sign up - delegated to better-auth
router.post("/signup", async (req: Request, res: Response) => {
  // This is a placeholder - actual implementation is handled by better-auth
  // Forward to better-auth's handler
  try {
    res.status(501).json({ error: "Use /auth/sign-up/email endpoint" })
  } catch (error) {
    res.status(500).json({ error: "Signup failed" })
  }
})

// Sign in - delegated to better-auth
router.post("/signin", async (req: Request, res: Response) => {
  // This is a placeholder - actual implementation is handled by better-auth
  // Forward to better-auth's handler
  try {
    res.status(501).json({ error: "Use /auth/sign-in/email endpoint" })
  } catch (error) {
    res.status(500).json({ error: "Sign in failed" })
  }
})

// Sign out - delegated to better-auth
router.post("/signout", async (req: Request, res: Response) => {
  // This is a placeholder - actual implementation is handled by better-auth
  try {
    res.status(501).json({ error: "Use /auth/sign-out endpoint" })
  } catch (error) {
    res.status(500).json({ error: "Sign out failed" })
  }
})

// Get session - delegated to better-auth
router.get("/session", async (req: Request, res: Response) => {
  // This is a placeholder - actual implementation is handled by better-auth
  try {
    res.status(501).json({ error: "Use /auth/session endpoint" })
  } catch (error) {
    res.status(500).json({ error: "Session check failed" })
  }
})

export default router
