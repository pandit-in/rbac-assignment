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
          toast(
            "Error: " +
              (result.error.message ||
                result.error.statusText ||
                "Invalid credentials")
          )
        } else {
          toast("Signed in successfully")
          router.push("/")
        }
      } catch (error) {
        const e = error as Error
        console.error("Catch block error:", e)
        toast(
          "Connection Error: " +
            (e.message || "Failed to connect to auth server")
        )
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full sm:max-w-sm">
        <CardHeader className="mb-6">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your details to sign in</CardDescription>
        </CardHeader>
        <CardContent>
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
  )
}
