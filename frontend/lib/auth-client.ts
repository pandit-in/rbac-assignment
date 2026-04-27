import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001";

if (process.env.NODE_ENV === "production") {
  console.log("Auth Client BaseURL:", baseURL);
}

export const authClient = createAuthClient({
  baseURL,
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
