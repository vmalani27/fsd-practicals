"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import type { InventoryItem, InventoryResponse } from "@/lib/types"
import { AddItemDialog } from "./add-item-dialog"
import { EditItemDialog } from "./edit-item-dialog"
import { DeleteItemDialog } from "./delete-item-dialog"
import { UserInventoryView } from "./user-inventory-view"

interface InventoryTableProps {
  userRole: string
}

export function InventoryTable({ userRole }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
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

  const handleItemAdded = () => {
    fetchItems()
    fetchCategories()
    setShowAddDialog(false)
  }

  const handleItemUpdated = () => {
    fetchItems()
    fetchCategories()
    setEditingItem(null)
  }

  const handleItemDeleted = () => {
    fetchItems()
    setDeletingItem(null)
  }

  if (userRole === "user") {
    return <UserInventoryView />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Items</CardTitle>
          {userRole === "admin" && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
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
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No items found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole === "admin" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{item.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.sku || "—"}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </TableCell>
                      {userRole === "admin" && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingItem(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
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
          </>
        )}
      </CardContent>

      {/* Dialogs */}
      <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} onItemAdded={handleItemAdded} />

      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {deletingItem && (
        <DeleteItemDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          item={deletingItem}
          onItemDeleted={handleItemDeleted}
        />
      )}
    </Card>
  )
}
