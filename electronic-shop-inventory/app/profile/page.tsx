"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User, Mail, Shield, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Fetch user profile from our API
        const response = await fetch("/api/auth/profile")
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and role information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(profile.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account and session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                {profile.role === "admin" && (
                  <Link href="/admin" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>

              <Separator />

              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
