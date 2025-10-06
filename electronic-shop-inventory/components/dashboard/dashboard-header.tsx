"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Package, User, Shield, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface DashboardHeaderProps {
  user: SupabaseUser
  userRole: string
}

export function DashboardHeader({ user, userRole }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">ElectroShop</h1>
              <p className="text-sm text-muted-foreground">Inventory Management</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Role: </span>
              <span className="font-medium capitalize text-foreground flex items-center gap-1">
                {userRole === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {userRole}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="flex items-center">
                    <Receipt className="mr-2 h-4 w-4" />
                    Billing & Invoices
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {userRole === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
