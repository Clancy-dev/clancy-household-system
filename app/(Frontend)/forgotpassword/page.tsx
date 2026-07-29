"use client"

import type React from "react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { forgotPassword } from "@/lib/actions/forgot-password"


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        await forgotPassword(email)
        setSubmitted(true)
        setEmail("")
      } catch (err) {
        setError("An error occurred. Please try again.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        <Card className="bg-card border-border shadow-lg">
          
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>

            <CardTitle className="text-3xl font-bold text-foreground">
              Reset Your Password
            </CardTitle>

            <p className="text-muted-foreground text-sm">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            
            {/* Success Message */}
            {submitted ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                    Check your email!
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    We&apos;ve sent a password reset link to your email. <span className="font-semibold">{email}</span>
                  </p>
                </div>

                <p className="text-muted-foreground text-sm text-center">
                  The link will expire in 30 minutes. If you don&apos;t receive an email, check your spam folder.
                </p>

                <Button
                  onClick={() => {
                    setSubmitted(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send another email
                </Button>

              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Error */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm">
                      {error}
                    </p>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background border-border"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary text-primary-foreground font-medium py-2 h-10"
                >
                  {isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

              </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
