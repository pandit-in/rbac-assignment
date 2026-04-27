"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fetcher, api } from "@/lib/api"

const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(400, "Address too long"),
  description: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
})

type StoreFormValues = z.infer<typeof storeSchema>

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function CreateStorePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: usersData, isLoading: isLoadingUsers } = useSWR<{
    users: User[]
  }>("/api/users", fetcher)

  const storeOwners =
    usersData?.users.filter((u) => u.role === "store_owner") || []

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      ownerId: "",
    },
  })

  async function onSubmit(values: StoreFormValues) {
    setIsSubmitting(true)
    try {
      await api.post("/api/stores", values)
      toast.success("Store created successfully")
      router.push("/admin/stores")
      router.refresh()
    } catch (error) {
      const e = error as Error
      console.error("Create store error:", error)
      toast.error("Connection Error:" + (e.message || "Failed to create store"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Add New Store</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new store and assign it to an owner
        </p>
      </div>

      <div className="">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Store Name</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Enter store name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="ownerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Store Owner</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : storeOwners.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No store owners found
                        </div>
                      ) : (
                        storeOwners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Enter store address"
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
                  <FieldLabel>Description (Optional)</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Enter store description"
                    className="resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Store"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
