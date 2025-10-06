export interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  stock_quantity: number
  sku?: string
  image_url?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface UserProfile {
  id: string
  email: string
  role: "admin" | "user"
  created_at: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface InventoryResponse {
  items: InventoryItem[]
  pagination: PaginationInfo
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
export type PaymentMethod = "cash" | "check" | "credit_card" | "bank_transfer" | "other"
export type PaymentTerms = "Net 15" | "Net 30" | "Net 60" | "Due on Receipt"

export interface BillingCustomer {
  id: string
  profile_id: string
  company_name: string
  billing_address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  phone?: string
  tax_id?: string
  created_at: string
  updated_at: string
  profiles: {
    email: string
  }
}

export interface BillingInvoice {
  id: string
  invoice_number: string
  customer_id: string
  created_by: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  notes?: string
  terms: PaymentTerms
  created_at: string
  updated_at: string
  customers: BillingCustomer
  invoice_items?: InvoiceItem[]
  payments?: Payment[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  inventory_item_id?: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number?: string
  notes?: string
  created_by: string
  created_at: string
}

export interface CreateInvoiceRequest {
  customer_id: string
  due_date: string
  terms: PaymentTerms
  notes?: string
  items: CreateInvoiceItem[]
}

export interface CreateInvoiceItem {
  inventory_item_id?: string
  description: string
  quantity: number
  unit_price: number
}

export interface BillingStats {
  totalInvoices: number
  totalAmount: number
  paidInvoices: number
  overdueInvoices: number
  pendingAmount: number
  paidAmount: number
}
