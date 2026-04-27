"use client"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { Button } from "./ui/button"
import { StoreIcon } from "lucide-react"
import { Spinner } from "./ui/spinner"

export default function Header() {
  const { data, isPending } = authClient.useSession()
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <StoreIcon />
          Store
        </Link>

        <nav className="flex items-center gap-4">
          {isPending ? (
            <Spinner />
          ) : data?.user ? (
            <div className="flex items-center gap-2">
              {data.user.role === "store_owner" && (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              {data.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => authClient.signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
