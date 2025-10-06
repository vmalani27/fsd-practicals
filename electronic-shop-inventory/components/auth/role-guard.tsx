"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/types"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole = "user", fallback }: RoleGuardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/profile")
        if (!response.ok) {
          router.push("/auth/login")
          return
        }

        const userProfile: UserProfile = await response.json()
        setProfile(userProfile)

        // Check role authorization
        if (requiredRole === "admin" && userProfile.role !== "admin") {
          setAuthorized(false)
        } else {
          setAuthorized(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. {requiredRole === "admin" && "Admin access required."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
