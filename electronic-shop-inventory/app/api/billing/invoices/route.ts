import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = supabase
      .from("invoices")
      .select(`
        *,
        customers (
          id,
          company_name,
          billing_address,
          city,
          state,
          profiles (
            email
          )
        ),
        invoice_items (
          id,
          description,
          quantity,
          unit_price,
          line_total
        ),
        payments (
          id,
          amount,
          payment_date,
          payment_method
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // If user is not admin, only show their invoices
    if (profile.role !== "admin") {
      const { data: customerData } = await supabase.from("customers").select("id").eq("profile_id", user.id).single()

      if (customerData) {
        query = query.eq("customer_id", customerData.id)
      } else {
        return NextResponse.json({ invoices: [], total: 0 })
      }
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error("Error fetching invoices:", error)
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase.from("invoices").select("*", { count: "exact", head: true })

    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status)
    }

    if (profile.role !== "admin") {
      const { data: customerData } = await supabase.from("customers").select("id").eq("profile_id", user.id).single()

      if (customerData) {
        countQuery = countQuery.eq("customer_id", customerData.id)
      }
    }

    const { count } = await countQuery

    return NextResponse.json({
      invoices: invoices || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Error in invoices API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { customer_id, due_date, terms, notes, items } = body

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json({ error: "Customer and items are required" }, { status: 400 })
    }

    // Generate invoice number
    const { data: invoiceNumberData } = await supabase.rpc("generate_invoice_number")

    const invoice_number = invoiceNumberData || `INV-${Date.now()}`

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number,
        customer_id,
        created_by: user.id,
        due_date,
        terms: terms || "Net 30",
        notes,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError)
      return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }

    // Create invoice items
    const invoiceItems = items.map((item: any) => ({
      invoice_id: invoice.id,
      inventory_item_id: item.inventory_item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError)
      return NextResponse.json({ error: "Failed to create invoice items" }, { status: 500 })
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error("Error in create invoice API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
