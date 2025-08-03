"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  MessageSquare,
  BookOpen,
  Target,
  Clock,
  Shield,
  Rocket,
  Globe,
  Heart,
  GraduationCap,
  CheckCircle,
  Key,
  Infinity,
} from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Generation",
    description:
      "Transform any study material into flashcards, quizzes, and practice tests instantly with advanced AI.",
    color: "text-yellow-400",
  },
  {
    icon: MessageSquare,
    title: "Unlimited AI Chat",
    description: "Connect your API keys for unlimited access to GPT-4, Claude, and Gemini. No usage limits, ever.",
    color: "text-blue-400",
  },
  {
    icon: BookOpen,
    title: "Smart Study Guides",
    description: "Generate comprehensive study guides that adapt to your learning style and highlight key concepts.",
    color: "text-green-400",
  },
  {
    icon: Target,
    title: "Organized Learning",
    description: "Keep all your study materials organized in one place with intuitive page management and search.",
    color: "text-purple-400",
  },
  {
    icon: Clock,
    title: "Study Efficiently",
    description: "Focus on what matters most. Our AI helps you identify key concepts and optimize your study time.",
    color: "text-pink-400",
  },
  {
    icon: Globe,
    title: "Multi-Format Support",
    description: "Upload PDFs, images, text files, and more. Our AI extracts and processes any study material.",
    color: "text-cyan-400",
  },
]

const stats = [
  { number: "100%", label: "Free Forever" },
  { number: "∞", label: "AI Usage*" },
  { number: "24/7", label: "Available" },
  { number: "❤️", label: "Made by Students" },
]

const benefits = [
  "Unlimited AI-generated flashcards and quizzes",
  "Connect your own API keys for unlimited AI chat",
  "Generate comprehensive study guides",
  "Upload and process any file format",
  "Organize materials with smart page management",
  "Search across all your study content",
  "Mobile-friendly responsive design",
  "No ads, no tracking, no premium tiers",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-white" />
                <Sparkles className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                StudyMate
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#story" className="text-gray-400 hover:text-white transition-colors">
                Our Story
              </Link>
              <Link href="#api-keys" className="text-gray-400 hover:text-white transition-colors">
                API Keys
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-zinc-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started Free
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-8">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">Built by Students, for Students</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Study Smarter with
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Unlimited AI Power
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform any study material into interactive flashcards and get unlimited AI tutoring. Connect your own
              API keys for unlimited usage, completely free forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link href="/auth/signup">
                <MagneticButton
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </MagneticButton>
              </Link>
              <Link href="#api-keys">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-gray-300 hover:bg-zinc-800 bg-transparent text-lg px-8 py-4"
                >
                  Learn About API Keys
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm lg:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">*With your own API keys</p>
          </div>
        </div>
      </section>

      {/* API Keys Section */}
      <section id="api-keys" className="py-20 lg:py-32 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-6">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Unlimited Usage</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Connect your API keys for
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                unlimited AI power
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              StudyMate works with your own API keys from OpenAI, Anthropic, and Google. This means unlimited usage at
              cost price, with no markup or restrictions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedCard className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Infinity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Unlimited Usage</h3>
              <p className="text-gray-400">
                No daily limits, no monthly caps. Use as much AI as you need for your studies.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Keys, Your Control</h3>
              <p className="text-gray-400">
                Your API keys stay secure and private. We never store or access your keys.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Cost Effective</h3>
              <p className="text-gray-400">Pay only what the AI providers charge. No markup, no subscription fees.</p>
            </AnimatedCard>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">
              Don't have API keys yet? No problem! You can still use StudyMate with limited free usage to get started.
            </p>
            <Link href="/auth/signup">
              <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Now
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Powerful Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                excel in your studies
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive tools to enhance your learning experience, all completely
              free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                className="bg-zinc-900/50 border-zinc-800 p-6 hover:bg-zinc-800/50 transition-colors duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-zinc-800/50 rounded-lg mr-4">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-6">
              <Rocket className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Simple Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Get started in
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Upload Materials</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload your PDFs, notes, textbooks, or any study material. Our AI supports multiple formats.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">AI Processing</h3>
              <p className="text-gray-400 leading-relaxed">
                Our advanced AI analyzes your content and generates flashcards, quizzes, and study guides automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Start Learning</h3>
              <p className="text-gray-400 leading-relaxed">
                Study with interactive materials and get unlimited help from AI tutors with your own API keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-6">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Our Mission</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Built by a student who
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                understands the struggle
              </span>
            </h2>
            <div className="text-lg text-gray-400 leading-relaxed space-y-6 max-w-3xl mx-auto">
              <p>
                StudyMate was created by a fellow student who experienced firsthand the challenges of managing study
                materials, creating effective flashcards, and getting help when professors weren't available.
              </p>
              <p>
                Instead of building another expensive platform, we decided to make StudyMate completely free because we
                believe that access to quality educational tools shouldn't depend on your financial situation.
              </p>
              <p>
                By connecting your own API keys, you get unlimited AI usage at cost price - no markup, no restrictions,
                just powerful AI tools to help you learn better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 lg:py-32 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700 mb-6">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Everything Included</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              All features,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                completely free
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              No hidden costs, no premium tiers, no limits. Just powerful AI-driven study tools available to every
              student.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatedCard className="bg-zinc-900/50 border-zinc-800 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                your learning?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with unlimited AI-powered tools. Start
              learning today, completely free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/auth/signup">
                <MagneticButton
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </MagneticButton>
              </Link>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">No signup required to explore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <Brain className="h-8 w-8 text-white" />
                  <Sparkles className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  StudyMate
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Free AI-powered learning platform built by students, for students. Study smarter with unlimited AI
                usage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#api-keys" className="hover:text-white transition-colors">
                    API Keys
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/api-setup" className="hover:text-white transition-colors">
                    API Setup Guide
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white transition-colors">
                    Send Feedback
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/open-source" className="hover:text-white transition-colors">
                    Open Source
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">© 2024 StudyMate. Made with ❤️ by students, for students.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Always free, unlimited with your API keys</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
