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

import { userFormSchema } from "@/lib/schemas"

const formSchema = userFormSchema

export default function SignupPage() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      password: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
          address: data.address,
        })
        if (result.error) {
          console.error("Sign up error:", result.error)
          toast(
            "Error: " +
              (result.error.message ||
                result.error.statusText ||
                "Failed to create account")
          )
        } else {
          toast("Account created successfully")
          router.push("/signin")
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Fill in the details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-form-name">
                      Full Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-form-email">Email</FieldLabel>

                    <Input
                      {...field}
                      id="signup-form-email"
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
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-form-address">
                      Address
                    </FieldLabel>

                    <Input
                      {...field}
                      id="signup-form-address"
                      placeholder="enter your address"
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
                    <FieldLabel htmlFor="signup-form-password">
                      Password
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="signup-form-password"
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
                  form="signup-form"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Create account"}
                </Button>
              </Field>
              <FieldDescription className="mt-6">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-primary">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </div>
    </div>
  )
}
