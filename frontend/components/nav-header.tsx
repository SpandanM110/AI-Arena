"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Activity, FileText, Users, History, Settings } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/transcript", label: "Live Transcript", icon: FileText },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/matches", label: "Matches", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function NavHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">AR</span>
          </div>
          <span className="text-lg font-semibold">AI Red/Blue Arena</span>
        </div>

        <nav className="ml-12 flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </div>
    </header>
  )
}
