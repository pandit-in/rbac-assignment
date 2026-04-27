import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
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
