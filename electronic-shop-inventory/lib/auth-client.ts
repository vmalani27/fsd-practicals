"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/types"

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setState({
          user: session.user,
          profile: profile
            ? {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                created_at: profile.created_at,
              }
            : null,
          loading: false,
        })
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setState({
          user: session.user,
          profile: profile
            ? {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                created_at: profile.created_at,
              }
            : null,
          loading: false,
        })
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

// Re-export for backward compatibility
export { useAuth as default }
