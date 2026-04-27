"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { toast } from "sonner"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const formSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters.")
    .max(60, "Name must be at most 60 characters."),
  email: z.email("Invalid email address."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters.")
    .max(400, "Address must be at most 400 characters."),
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password must be at most 16 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character."
    ),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password must be at most 16 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character."
    ),
})

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending: Pending } = authClient.useSession()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      address: (session?.user as { address?: string })?.address || "",

      currentPassword: "",
      newPassword: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        // Update basic info first if needed
        await authClient.updateUser({
          name: data.name,
          address: data.address,
        } as { name?: string; address?: string })


        // Then change password
        const result = await authClient.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: true,
        })

        if (result.error) {
          console.error("Change password error:", result.error)
          toast.error(
            "Error: " + (result.error.message || "Failed to update password")
          )
        } else {
          toast.success("Settings updated successfully")
          form.reset({
            ...data,
            currentPassword: "",
            newPassword: "",
          })
        }
      } catch (error) {
        const e = error as Error
        console.error("Catch block error:", e)
        toast.error("Error: " + (e.message || "An unexpected error occurred"))
      }
    })
  }

  if (!session) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">
            Please login to access settings
          </p>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </div>
      </div>
    )
  }

  if (Pending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main>
      <div className="mx-auto mt-20 max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Account Settings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your profile and security
            </p>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your name and address</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-form-name">Name</FieldLabel>
                        <Input
                          {...field}
                          id="signup-form-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Update your name"
                          autoComplete="name"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="address"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="settings-address">
                          Address
                        </FieldLabel>
                        <Input
                          {...field}
                          id="settings-address"
                          aria-invalid={fieldState.invalid}
                          placeholder="Update your address"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="currentPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="settings-current-password">
                          Current Password
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id="settings-current-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            aria-invalid={fieldState.invalid}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="newPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="settings-new-password">
                          New Password
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id="settings-new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            aria-invalid={fieldState.invalid}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={isPending}
                    >
                      {isPending ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
