import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { InventoryStats } from "@/components/dashboard/inventory-stats"
import { InventoryTable } from "@/components/dashboard/inventory-table"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} userRole={profile.role} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {params.error === "unauthorized" && (
            <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              Access denied. You don't have permission to access that page.
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {profile.role === "admin" ? "Admin Dashboard" : "Inventory View"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {profile.role === "admin"
                  ? "Manage your electronic shop inventory"
                  : "Browse available inventory items"}
              </p>
            </div>

            {profile.role === "admin" && (
              <Button asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            )}
          </div>

          <InventoryStats userRole={profile.role} />
          <InventoryTable userRole={profile.role} />
        </div>
      </main>
    </div>
  )
}
