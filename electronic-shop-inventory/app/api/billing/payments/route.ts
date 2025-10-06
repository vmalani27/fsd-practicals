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
    const invoiceId = searchParams.get("invoice_id")

    let query = supabase
      .from("payments")
      .select(`
        *,
        invoices (
          invoice_number,
          customers (
            company_name,
            profiles (
              email
            )
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId)
    }

    // If user is not admin, only show payments for their invoices
    if (profile.role !== "admin") {
      const { data: customerData } = await supabase.from("customers").select("id").eq("profile_id", user.id).single()

      if (customerData) {
        // Get invoices for this customer
        const { data: invoiceData } = await supabase.from("invoices").select("id").eq("customer_id", customerData.id)

        if (invoiceData && invoiceData.length > 0) {
          const invoiceIds = invoiceData.map((inv) => inv.id)
          query = query.in("invoice_id", invoiceIds)
        } else {
          return NextResponse.json({ payments: [] })
        }
      } else {
        return NextResponse.json({ payments: [] })
      }
    }

    const { data: payments, error } = await query

    if (error) {
      console.error("Error fetching payments:", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json({ payments: payments || [] })
  } catch (error) {
    console.error("Error in payments API:", error)
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
    const { invoice_id, amount, payment_date, payment_method, reference_number, notes } = body

    if (!invoice_id || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invoice ID and valid amount are required" }, { status: 400 })
    }

    // Verify invoice exists
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, total_amount, status")
      .eq("id", invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id,
        amount,
        payment_date: payment_date || new Date().toISOString().split("T")[0],
        payment_method: payment_method || "check",
        reference_number,
        notes,
        created_by: user.id,
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating payment:", paymentError)
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    // Check if invoice should be marked as paid
    const { data: allPayments } = await supabase.from("payments").select("amount").eq("invoice_id", invoice_id)

    if (allPayments) {
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)

      if (totalPaid >= invoice.total_amount && invoice.status !== "paid") {
        await supabase.from("invoices").update({ status: "paid" }).eq("id", invoice_id)
      }
    }

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error("Error in create payment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
