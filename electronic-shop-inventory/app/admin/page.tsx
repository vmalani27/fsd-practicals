import { requireAdmin } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { InventoryStats } from "@/components/dashboard/inventory-stats"
import { InventoryTable } from "@/components/dashboard/inventory-table"
import { AdminUserManagement } from "@/components/admin/admin-user-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
  const profile = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ id: profile.id, email: profile.email }} userRole={profile.role} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Advanced administration and management tools</p>
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList>
              <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <InventoryStats userRole={profile.role} />
              <InventoryTable userRole={profile.role} />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
