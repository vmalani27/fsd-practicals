import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters for filtering and pagination
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = supabase
      .from("inventory_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: items, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 })
    }

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
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
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, price, stock_quantity, sku, image_url } = body

    // Validate required fields
    if (!name || !category || price === undefined || stock_quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, price, stock_quantity" },
        { status: 400 },
      )
    }

    // Validate data types
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 })
    }

    if (typeof stock_quantity !== "number" || stock_quantity < 0) {
      return NextResponse.json({ error: "Stock quantity must be a non-negative number" }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from("inventory_items")
      .insert({
        name,
        description,
        category,
        price,
        stock_quantity,
        sku,
        image_url,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "23505") {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
    }

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
