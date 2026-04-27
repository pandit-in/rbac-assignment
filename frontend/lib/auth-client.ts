import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
      ? "/_/backend/api/auth"
      : "http://localhost:3001/api/auth"),

  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "user",
        required: true,
      },
      address: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [adminClient()],
})
