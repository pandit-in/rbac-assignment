import "dotenv/config"
import express from "express"
import cors from "cors"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js"
import adminRouter from "./routes/admin.js"
import usersRouter from "./routes/users.js"
import ratingsRouter from "./routes/ratings.js"
import storesRouter from "./routes/stores.js"

const app = express()
app.set("trust proxy", true)
const port = process.env.PORT || 3001

app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || ["http://localhost:3000"],
    credentials: true,
  })
)

app.all("/api/auth/*splat", toNodeHandler(auth))

app.get("/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  return res.json(session)
})

app.use("/api/users", usersRouter)
app.use("/api/stores", storesRouter)
app.use("/api/ratings", ratingsRouter)
app.use("/api/admin", adminRouter)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err)
    res.status(500).json({
      error: err.message || "Internal server error",
    })
    next()
  }
)

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`)
})
