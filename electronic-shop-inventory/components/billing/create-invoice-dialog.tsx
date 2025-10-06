"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Customer {
  id: string
  company_name: string
  profiles: {
    email: string
  }
}

interface InventoryItem {
  id: string
  name: string
  price: number
  stock_quantity: number
}

interface InvoiceItem {
  inventory_item_id: string
  description: string
  quantity: number
  unit_price: number
}

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceCreated: () => void
}

export function CreateInvoiceDialog({ open, onOpenChange, onInvoiceCreated }: CreateInvoiceDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: "",
    due_date: "",
    terms: "Net 30",
    notes: "",
  })
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { inventory_item_id: "", description: "", quantity: 1, unit_price: 0 },
  ])

  useEffect(() => {
    if (open) {
      fetchCustomers()
      fetchInventoryItems()
    }
  }, [open])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/billing/customers")
      const data = await response.json()
      if (response.ok) {
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      const data = await response.json()
      if (response.ok) {
        setInventoryItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error)
    }
  }

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { inventory_item_id: "", description: "", quantity: 1, unit_price: 0 }])
  }

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
    }
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Auto-fill description and price when inventory item is selected
    if (field === "inventory_item_id") {
      const selectedItem = inventoryItems.find((item) => item.id === value)
      if (selectedItem) {
        updatedItems[index].description = selectedItem.name
        updatedItems[index].unit_price = selectedItem.price
      }
    }

    setInvoiceItems(updatedItems)
  }

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.quantity * item.unit_price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: invoiceItems.filter((item) => item.description && item.quantity > 0),
        }),
      })

      if (response.ok) {
        onInvoiceCreated()
        onOpenChange(false)
        // Reset form
        setFormData({ customer_id: "", due_date: "", terms: "Net 30", notes: "" })
        setInvoiceItems([{ inventory_item_id: "", description: "", quantity: 1, unit_price: 0 }])
      } else {
        const data = await response.json()
        console.error("Error creating invoice:", data.error)
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>Create a new invoice for a customer with line items</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name} ({customer.profiles.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Select value={formData.terms} onValueChange={(value) => setFormData({ ...formData, terms: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the invoice..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Inventory Item</Label>
                    <Select
                      value={item.inventory_item_id}
                      onValueChange={(value) => updateInvoiceItem(index, "inventory_item_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.name} (${invItem.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, "description", e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateInvoiceItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInvoiceItem(index)}
                      disabled={invoiceItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <div className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">(Tax will be calculated automatically)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
