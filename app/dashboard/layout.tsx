"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== "store_owner")) {
      router.push("/")
    }
  }, [isPending, session, router])

  if (isPending || !session || session.user.role !== "store_owner") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background">{children}</main>
    </>
  )
}
