"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && (!session?.user || session.user?.role !== "admin")) {
      router.push("/")
    }
  }, [isPending, session, router])

  if (isPending || !session?.user || session.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <main className="mt-20 min-h-screen bg-background">{children}</main>
    </>
  )
}
