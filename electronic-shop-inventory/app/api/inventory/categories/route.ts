import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    const { data: categories, error } = await supabase
      .from("inventory_items")
      .select("category")
      .not("category", "is", null)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories.map((item) => item.category))].sort()

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
