"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react"
import type { InventoryItem } from "@/lib/types"

interface InventoryStatsProps {
  userRole: string
}

interface Stats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  categories: number
}

export function InventoryStats({ userRole }: InventoryStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    categories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all inventory items
        const response = await fetch("/api/inventory?limit=1000")
        if (!response.ok) throw new Error("Failed to fetch inventory")

        const data = await response.json()
        const items: InventoryItem[] = data.items

        // Calculate stats
        const totalItems = items.length
        const totalValue = items.reduce((sum, item) => sum + item.price * item.stock_quantity, 0)
        const lowStockItems = items.filter((item) => item.stock_quantity < 10).length
        const categories = new Set(items.map((item) => item.category)).size

        setStats({
          totalItems,
          totalValue,
          lowStockItems,
          categories,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards =
    userRole === "admin"
      ? [
          {
            title: "Total Items",
            value: stats.totalItems.toLocaleString(),
            icon: Package,
            description: "Items in inventory",
          },
          {
            title: "Total Value",
            value: `$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            description: "Total inventory value",
          },
          {
            title: "Low Stock",
            value: stats.lowStockItems.toLocaleString(),
            icon: AlertTriangle,
            description: "Items below 10 units",
            alert: stats.lowStockItems > 0,
          },
          {
            title: "Categories",
            value: stats.categories.toLocaleString(),
            icon: TrendingUp,
            description: "Product categories",
          },
        ]
      : [
          {
            title: "Available Items",
            value: stats.totalItems.toLocaleString(),
            icon: Package,
            description: "Items in catalog",
          },
          {
            title: "Categories",
            value: stats.categories.toLocaleString(),
            icon: TrendingUp,
            description: "Product categories",
          },
        ]

  return (
    <div className={`grid gap-4 ${userRole === "admin" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"}`}>
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.alert ? "text-destructive" : ""}`}>
              {loading ? "..." : stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
