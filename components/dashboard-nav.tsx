"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Calculator, Database, LogOut, User } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Database,
    },
    {
      href: "/dashboard/instruments",
      label: "Database Instrumen",
      icon: Database,
    },
    {
      href: "/dashboard/calculator",
      label: "Kalkulator Budget Ketidakpastian",
      icon: Calculator,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <span className="font-bold text-lg">Budget Ketidakpastian</span>
          </Link>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{session?.user?.email}</span>
          </div>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </header>
  )
}
