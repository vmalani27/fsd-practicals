import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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
    const { role } = body

    // Validate role
    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'user'" }, { status: 400 })
    }

    // Prevent admin from demoting themselves
    if (id === user.id && role !== "admin") {
      return NextResponse.json({ error: "Cannot change your own admin role" }, { status: 400 })
    }

    // Update user role
    const { data: updatedUser, error } = await supabase.from("profiles").update({ role }).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
