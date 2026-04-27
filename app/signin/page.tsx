"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Eye, EyeOff } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
})

export default function SigninPage() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await authClient.signIn.email({
          email: data.email,
          password: data.password,
          callbackURL: "/",
        })

        if (result.error) {
          console.error("Sign in error:", result.error)
          let errorMessage = "Invalid credentials. Please check your email and password."
          
          if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            errorMessage = "Incorrect email or password. Please try again."
          } else if (result.error.message) {
            errorMessage = result.error.message
          }

          toast.error(errorMessage)
        } else {
          toast.success("Signed in successfully")
          router.push("/")
        }
      } catch (error) {
        const e = error as Error
        console.error("Catch block error:", e)
        toast.error(
          "Connection Error: " + (e.message || "Failed to connect to auth server")
        )
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-4xl flex-col gap-8 lg:flex-row lg:items-center">
        {/* Left side: Sign In Form */}
        <div className="w-full lg:flex-1">
          <div className="mx-auto max-w-sm">
            <CardHeader className="mb-6 px-0">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your details to sign in</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-form-email">Email</FieldLabel>
                        <Input
                          {...field}
                          id="signin-form-email"
                          type="email"
                          placeholder="enter your email"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-form-password">
                          Password
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            {...field}
                            id="signin-form-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="enter your password"
                            aria-invalid={fieldState.invalid}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
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
                      className="w-full"
                      type="submit"
                      form="signin-form"
                      disabled={isPending}
                    >
                      {isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </Field>
                  <FieldDescription className="mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-primary">
                      Sign up
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </div>
        </div>

        {/* Right side: Demo Credentials */}
        <div className="w-full lg:w-80">
          <div className="rounded-xl border bg-muted/50 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Demo Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Admin</p>
                <code className="mt-1 block rounded bg-background p-2 text-xs">
                  admin@roxiler.com<br/>Admin@123
                </code>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">User</p>
                <code className="mt-1 block rounded bg-background p-2 text-xs">
                  user1@test.com<br/>User@123
                </code>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Store Owner</p>
                <code className="mt-1 block rounded bg-background p-2 text-xs">
                  owner1@store.com<br/>Owner@123
                </code>
              </div>
            </div>
            <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground">
              Note: Use these accounts to explore different Role-Based Access Control features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
