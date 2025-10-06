import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: item, error } = await supabase.from("inventory_items").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch inventory item" }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Validate data types if provided
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 })
    }

    if (stock_quantity !== undefined && (typeof stock_quantity !== "number" || stock_quantity < 0)) {
      return NextResponse.json({ error: "Stock quantity must be a non-negative number" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (price !== undefined) updateData.price = price
    if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity
    if (sku !== undefined) updateData.sku = sku
    if (image_url !== undefined) updateData.image_url = image_url

    const { data: item, error } = await supabase
      .from("inventory_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const { error } = await supabase.from("inventory_items").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
