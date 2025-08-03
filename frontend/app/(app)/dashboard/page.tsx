"use client"

import Link from "next/link"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageSquare, Plus, TrendingUp, Zap, BookOpen, Clock, ArrowRight } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

// Mock data - reduced for overview
const recentPages = [
  {
    id: "1",
    title: "Calculus I - Derivatives",
    lastModified: "2 hours ago",
    progress: 75,
  },
  {
    id: "2",
    title: "World War II History",
    lastModified: "1 day ago",
    progress: 60,
  },
]

const recentChats = [
  {
    id: "1",
    title: "Help with derivatives",
    timestamp: "1 hour ago",
    model: "GPT-4",
  },
  {
    id: "2",
    title: "WWII Timeline Questions",
    timestamp: "2 days ago",
    model: "Claude",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 relative">
      {/* Welcome Section */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">AI-Powered Learning</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Continue your learning journey with AI-powered study materials and personalized assistance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="text-center p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-600 rounded-full">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">12</div>
          <div className="text-blue-400 font-medium">Study Pages</div>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            +2 this week
          </div>
        </AnimatedCard>

        <AnimatedCard className="text-center p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-600 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">8</div>
          <div className="text-purple-400 font-medium">AI Chats</div>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
            <Zap className="w-4 h-4 mr-1" />
            Active today
          </div>
        </AnimatedCard>

        <AnimatedCard className="text-center p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-600 rounded-full">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">47</div>
          <div className="text-green-400 font-medium">Materials</div>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12 generated
          </div>
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedCard className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Create Study Page
            </h3>
          </div>
          <p className="text-gray-400 mb-4">
            Upload materials and generate flashcards, study guides, and practice tests with AI
          </p>
          <Link href="/pages/new">
            <MagneticButton className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Study Page
            </MagneticButton>
          </Link>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Start AI Chat
            </h3>
          </div>
          <p className="text-gray-400 mb-4">Get instant help and explanations from AI tutors across all subjects</p>
          <Link href="/chats/new">
            <MagneticButton className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </MagneticButton>
          </Link>
        </AnimatedCard>
      </div>

      {/* Recent Activity Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Pages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Recent Pages
            </h2>
            <Link href="/pages">
              <MagneticButton
                variant="outline"
                size="sm"
                className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </Link>
          </div>

          <div className="space-y-3">
            {recentPages.map((page) => (
              <Link key={page.id} href={`/pages/${page.id}`}>
                <AnimatedCard className="cursor-pointer bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-base font-semibold text-white">{page.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {page.lastModified}
                      </div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${page.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{page.progress}% complete</div>
                  </CardContent>
                </AnimatedCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Recent Chats
            </h2>
            <Link href="/chats">
              <MagneticButton
                variant="outline"
                size="sm"
                className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </Link>
          </div>

          <div className="space-y-3">
            {recentChats.map((chat) => (
              <Link key={chat.id} href={`/chats/${chat.id}`}>
                <AnimatedCard className="cursor-pointer bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-base font-semibold text-white">{chat.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-zinc-800 text-purple-400 rounded border border-zinc-700">
                          {chat.model}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {chat.timestamp}
                    </div>
                  </CardContent>
                </AnimatedCard>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <AnimatedCard className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <TrendingUp className="w-5 h-5 mr-3 text-green-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Generated 5 flashcards for Calculus I</span>
                </div>
              </div>
              <span className="text-sm text-blue-400 font-medium">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">Completed practice test for World War II</span>
                </div>
              </div>
              <span className="text-sm text-green-400 font-medium">1 day ago</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">Created new study guide for Organic Chemistry</span>
                </div>
              </div>
              <span className="text-sm text-purple-400 font-medium">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
