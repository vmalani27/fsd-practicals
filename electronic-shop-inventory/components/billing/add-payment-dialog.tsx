"use client"

import type React from "react"

import { useState } from "react"
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
import type { PaymentMethod } from "@/lib/types"

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
  onPaymentAdded: () => void
}

export function AddPaymentDialog({ open, onOpenChange, invoice, onPaymentAdded }: AddPaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "check" as PaymentMethod,
    reference_number: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/billing/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          ...formData,
          amount: Number.parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        onPaymentAdded()
        onOpenChange(false)
        // Reset form
        setFormData({
          amount: "",
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "check",
          reference_number: "",
          notes: "",
        })
      } else {
        const data = await response.json()
        console.error("Error adding payment:", data.error)
      }
    } catch (error) {
      console.error("Error adding payment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) return null

  const remainingBalance =
    invoice.total_amount - (invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Record a payment for invoice {invoice.invoice_number}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Invoice Details</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>Invoice Total:</span>
                <span className="font-medium">${invoice.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount Paid:</span>
                <span className="font-medium">
                  ${(invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-1">
                <span>Balance Due:</span>
                <span className="text-red-600">${remainingBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Check number, transaction ID, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional payment notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
