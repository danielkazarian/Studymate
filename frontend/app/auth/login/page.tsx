"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Brain, Eye, EyeOff, Sparkles, Zap, MessageSquare, TrendingUp } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const { state, login, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Gradient & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute top-40 right-32 w-24 h-24 bg-blue-400/20 rounded-lg rotate-45 animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-32 left-32 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-20 right-20 w-20 h-20 bg-pink-400/20 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white py-12 lg:py-16">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="relative">
                <Brain className="h-12 w-12 text-white" />
                <Sparkles className="h-5 w-5 text-blue-200 absolute -top-1 -right-1" />
              </div>
              <span className="ml-4 text-4xl font-bold">StudyMate</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Transform Your Learning
              <br />
              <span className="text-blue-200">with AI Power</span>
            </h1>

            <p className="text-lg lg:text-xl text-blue-100 mb-12 leading-relaxed">
              Upload any study material and instantly generate flashcards, quizzes, and get unlimited AI tutoring.
              Connect your API keys for unlimited usage at cost price.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Instant AI Generation</h3>
                  <p className="text-blue-100">Create flashcards and quizzes from any material</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <MessageSquare className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Unlimited AI Tutoring</h3>
                  <p className="text-blue-100">Get help from GPT-4, Claude, and Gemini with your API keys</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Smart Organization</h3>
                  <p className="text-blue-100">Keep all your study materials organized and searchable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <AnimatedCard className="bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardHeader className="text-center pb-6">
              {/* Mobile logo */}
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <div className="relative">
                  <Brain className="h-10 w-10 text-white" />
                  <Sparkles className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
                </div>
                <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  StudyMate
                </span>
              </div>

              <CardTitle className="text-3xl font-bold text-white mb-2">Welcome back</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <MagneticButton
                variant="outline"
                className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 transition-colors duration-200 py-4"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </MagneticButton>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-4 text-gray-400 font-medium">Or continue with email</span>
                </div>
              </div>

              {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{state.error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 py-4"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-colors duration-200 pr-12 py-4"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <MagneticButton
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? "Signing In..." : "Sign In"}
                </MagneticButton>
              </form>

              <div className="text-center space-y-4">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
                <div className="text-sm text-gray-400">
                  {"Don't have an account? "}
                  <Link
                    href="/auth/signup"
                    className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-700">
                <div className="text-xs text-center text-gray-500 mb-3 font-medium">Supported AI Models</div>
                <div className="flex justify-center space-x-6 text-xs">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>OpenAI</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Claude</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Gemini</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
