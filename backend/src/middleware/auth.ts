import type { Request, Response, NextFunction } from "express"
import { auth } from "../lib/auth.js"
import type { User, Session } from "../db/schema/auth.js"

export interface AuthRequest extends Request {
  user?: User
  session?: Session
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    })

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    req.session = session.session as Session
    req.user = session.user as User
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ error: "Unauthorized" })
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    })

    if (session) {
      req.session = session.session as Session
      req.user = session.user as User
    }

    next()
  } catch (error) {
    console.error("Optional auth error:", error)
    next()
  }
}

export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as any),
      })

      if (!session || !roles.includes(session.user?.role || "")) {
        return res.status(403).json({ error: "Forbidden" })
      }

      req.session = session.session as Session
      req.user = session.user as User
      next()
    } catch (error) {
      console.error("Role check error:", error)
      res.status(403).json({ error: "Forbidden" })
    }
  }
}
