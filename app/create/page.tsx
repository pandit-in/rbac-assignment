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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"
import { createStore } from "@/lib/api"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  address: z.string().min(3, "Address must be at least 3 characters."),
  description: z.string().optional(),
})

export default function CreateStorePage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
  })

  if (isAuthPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    router.push("/signin")
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await createStore(data)
      toast.success("Store created successfully")
      router.push("/stores")
    } catch (error) {
      toast.error((error as Error).message || "Failed to create store")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full sm:max-w-sm">
        <CardHeader className="mb-6">
          <CardTitle>Create Store</CardTitle>
          <CardDescription>
            Fill in the details to create your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="create-store-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-store-form-name">
                      Store Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-store-form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your store name"
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
                    <FieldLabel htmlFor="create-store-form-address">
                      Store Address
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-store-form-address"
                      placeholder="enter your store address"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-store-form-description">
                      Description
                    </FieldLabel>
                    <Input
                      {...field}
                      id="create-store-form-description"
                      placeholder="enter your description"
                      aria-invalid={fieldState.invalid}
                    />
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
                  form="create-store-form"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating store..." : "Create store"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </div>
    </div>
  )
}
