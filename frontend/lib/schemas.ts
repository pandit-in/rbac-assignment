import * as z from "zod"

export const userFormSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters.")
    .max(60, "Name must be at most 60 characters."),
  email: z.email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters.")
    .max(400, "Address must be at most 400 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password must be at most 16 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character."
    ),
})

export const adminUserFormSchema = userFormSchema.extend({
  role: z.enum(["user", "admin", "store_owner"]),
})
