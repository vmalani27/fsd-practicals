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

    let query = supabase
      .from("customers")
      .select(`
        *,
        profiles (
          email
        )
      `)
      .order("created_at", { ascending: false })

    // If user is not admin, only show their own customer record
    if (profile.role !== "admin") {
      query = query.eq("profile_id", user.id)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error("Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }

    return NextResponse.json({ customers: customers || [] })
  } catch (error) {
    console.error("Error in customers API:", error)
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
    const { profile_id, company_name, billing_address, city, state, zip_code, phone, tax_id } = body

    if (!profile_id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        profile_id,
        company_name,
        billing_address,
        city,
        state,
        zip_code,
        phone,
        tax_id,
      })
      .select(`
        *,
        profiles (
          email
        )
      `)
      .single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Error in create customer API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
