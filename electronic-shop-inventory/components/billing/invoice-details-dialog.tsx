"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { AddPaymentDialog } from "./add-payment-dialog"
import { useAuth } from "@/lib/auth-client"

interface InvoiceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
  onInvoiceUpdated: () => void
}

export function InvoiceDetailsDialog({ open, onOpenChange, invoice, onInvoiceUpdated }: InvoiceDetailsDialogProps) {
  const { profile } = useAuth()
  const [showAddPayment, setShowAddPayment] = useState(false)

  if (!invoice) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "default" as const },
      paid: { label: "Paid", variant: "default" as const },
      overdue: { label: "Overdue", variant: "destructive" as const },
      cancelled: { label: "Cancelled", variant: "secondary" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const totalPaid = invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0
  const balanceDue = invoice.total_amount - totalPaid

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
                <DialogDescription>Complete invoice information and payment history</DialogDescription>
              </div>
              {profile?.role === "admin" && balanceDue > 0 && (
                <Button onClick={() => setShowAddPayment(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Information</CardTitle>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Bill To:</h4>
                    <div className="space-y-1">
                      <div className="font-medium">{invoice.customers.company_name}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customers.profiles.email}</div>
                      {invoice.customers.billing_address && (
                        <div className="text-sm text-muted-foreground">
                          {invoice.customers.billing_address}
                          {invoice.customers.city && `, ${invoice.customers.city}`}
                          {invoice.customers.state && `, ${invoice.customers.state}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Terms:</span>
                      <span>{invoice.terms}</span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.invoice_items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.line_total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(invoice.tax_rate * 100).toFixed(2)}%):</span>
                    <span>${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                            <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                            <TableCell>{payment.reference_number || "-"}</TableCell>
                            <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Total Paid:</span>
                        <span className="font-medium text-green-600">${totalPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Balance Due:</span>
                        <span className={`font-medium ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                          ${balanceDue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No payments recorded yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AddPaymentDialog
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
        invoice={invoice}
        onPaymentAdded={onInvoiceUpdated}
      />
    </>
  )
}
