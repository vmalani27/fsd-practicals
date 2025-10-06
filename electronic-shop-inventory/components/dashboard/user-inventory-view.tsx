"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Package2, DollarSign } from "lucide-react"
import type { InventoryItem, InventoryResponse } from "@/lib/types"

export function UserInventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (search) params.append("search", search)
      if (category) params.append("category", category)

      const response = await fetch(`/api/inventory?${params}`)
      if (!response.ok) throw new Error("Failed to fetch items")

      const data: InventoryResponse = await response.json()
      setItems(data.items)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/inventory/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")

      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [page, search, category])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value === "all" ? "" : value)
    setPage(1)
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (quantity < 10) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Package2 className="h-5 w-5 animate-spin" />
            Loading inventory...
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const stockStatus = getStockStatus(item.stock_quantity)
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div
                      className={`${item.image_url ? "hidden" : ""} absolute inset-0 flex items-center justify-center`}
                    >
                      <Package2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={stockStatus.variant} className="text-xs">
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-bold text-lg text-foreground">{item.price.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Stock: <span className="font-medium">{item.stock_quantity}</span>
                        </div>
                      </div>

                      {item.sku && (
                        <div className="text-xs text-muted-foreground">
                          SKU: <span className="font-mono">{item.sku}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
