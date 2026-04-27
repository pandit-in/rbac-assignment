import "dotenv/config";
import express from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import ratingsRouter from "./routes/ratings.js";
import storesRouter from "./routes/stores.js";

const app = express();
app.set("trust proxy", true); // Required for secure cookies on Render/Vercel
const port = process.env.PORT || 3001;

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow all backend URLs
      if (origin.includes("rbac-assignment")) return callback(null, true);

      // Allow local dev
      if (origin.includes("localhost") || origin.includes("[IP_ADDRESS]")) {
        return callback(null, true);
      }

      // Allow Render preview deploys
      if (origin.includes("onrender.com") && origin.includes("preview")) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

console.log("Backend starting...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);

const apiRouter = express.Router();

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "RBAC Backend is running" });
});

// Auth routes - mounted directly on app to prevent path stripping in apiRouter
app.use("/api/auth", toNodeHandler(auth));

apiRouter.get("/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/stores", storesRouter);
apiRouter.use("/ratings", ratingsRouter);
apiRouter.use("/admin", adminRouter);

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: err.message || "Internal server error",
    });
    next();
  },
);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
