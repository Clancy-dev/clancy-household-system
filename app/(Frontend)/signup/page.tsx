"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Lock, User, Mail, UserPlus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { registerAction } from "@/lib/actions/auth-actions"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [role, setRole] = useState<string>("USER")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // 🔹 Check if first user (ADMIN) or normal user
  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/check-admin")
        const data = await res.json()
        setRole(data.role)
      } catch (err) {
        console.error("Error checking role:", err)
      }
    }
    fetchRole()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)

    const firstName = (formData.get("firstName") as string)?.trim()
    const lastName = (formData.get("lastName") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // ✅ Field-level validation
    if (!firstName) return setFieldErrors({ firstName: "First name is required" })
    if (!lastName) return setFieldErrors({ lastName: "Last name is required" })
    if (!email) return setFieldErrors({ email: "Email is required" })
    if (!password) return setFieldErrors({ password: "Password is required" })
    if (!confirmPassword)
      return setFieldErrors({ confirmPassword: "Confirm password is required" })
    if (password !== confirmPassword)
      return setFieldErrors({ confirmPassword: "Passwords do not match" })

    startTransition(async () => {
      try {
        // ✅ Create user
        const result = await registerAction(formData)

        if (!result.success) {
          if (result.field) {
            setFieldErrors({ [result.field]: result.error || "Invalid input" })
          } else {
            setError(result.error || "Registration failed")
          }
          return
        }

        // ✅ Auto login with NextAuth
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (res?.error) {
          setError("Account created, but login failed")
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } catch (err) {
        console.error("Registration error:", err)
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Image Section - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="relative w-full h-full max-h-[600px] rounded-2xl overflow-hidden">
            <Image
              src="/logo.png"
              alt="Manage your household better"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center p-4 lg:p-8">
          <Card className="w-full max-w-md bg-card border-border shadow-lg">
            <CardHeader className="text-center space-y-4 pt-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>

              <CardTitle className="text-3xl font-bold text-foreground">Create Account</CardTitle>

              <p className="text-muted-foreground">
                Join to start creating your receipt.
              </p>

            </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      className="pl-10 bg-background border-border"
                      required
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="text-destructive text-xs">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      className="pl-10 bg-background border-border"
                      required
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="text-destructive text-xs">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 bg-background border-border"
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-destructive text-xs">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-border"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-destructive text-xs">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-background border-border"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-destructive text-xs">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary cursor-pointer text-primary-foreground font-medium py-2 h-10"
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                log in
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
