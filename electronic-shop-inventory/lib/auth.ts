import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { UserProfile } from "@/lib/types"

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    created_at: profile.created_at,
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const profile = await getCurrentUserProfile()
  if (!profile) {
    redirect("/auth/login")
  }
  if (profile.role !== "admin") {
    redirect("/dashboard?error=unauthorized")
  }
  return profile
}

export async function checkUserRole(requiredRole: "admin" | "user") {
  const profile = await getCurrentUserProfile()
  if (!profile) {
    return false
  }

  if (requiredRole === "admin") {
    return profile.role === "admin"
  }

  return true // All authenticated users can access "user" level content
}
