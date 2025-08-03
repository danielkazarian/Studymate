"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MessageSquare, Clock, Filter, MoreVertical, Bot, Zap, TrendingUp } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

// Mock data
const chats = [
  {
    id: "1",
    title: "Help with derivatives",
    lastMessage: "Can you explain the chain rule?",
    timestamp: "1 hour ago",
    model: "GPT-4",
    messageCount: 12,
    status: "active",
  },
  {
    id: "2",
    title: "WWII Timeline Questions",
    lastMessage: "What were the major battles in 1943?",
    timestamp: "2 days ago",
    model: "Claude",
    messageCount: 8,
    status: "completed",
  },
  {
    id: "3",
    title: "Python debugging help",
    lastMessage: "My code is throwing an error...",
    timestamp: "1 week ago",
    model: "GPT-4",
    messageCount: 15,
    status: "active",
  },
  {
    id: "4",
    title: "Chemistry reactions",
    lastMessage: "How do I balance this equation?",
    timestamp: "2 weeks ago",
    model: "Gemini",
    messageCount: 6,
    status: "completed",
  },
]

const getModelColor = (model: string) => {
  switch (model) {
    case "GPT-4":
      return "bg-green-900 text-green-400 border-green-800"
    case "Claude":
      return "bg-purple-900 text-purple-400 border-purple-800"
    case "Gemini":
      return "bg-blue-900 text-blue-400 border-blue-800"
    default:
      return "bg-gray-900 text-gray-400 border-gray-800"
  }
}

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterModel, setFilterModel] = useState("all")

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterModel === "all" || chat.model === filterModel
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Chats</h1>
          <p className="text-gray-400 mt-1">Get personalized help from AI tutors</p>
        </div>
        <Link href="/chats/new">
          <MagneticButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </MagneticButton>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500/20"
          >
            <option value="all">All Models</option>
            <option value="GPT-4">GPT-4</option>
            <option value="Claude">Claude</option>
            <option value="Gemini">Gemini</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Chats</p>
              <p className="text-2xl font-bold text-white">{chats.length}</p>
            </div>
            <div className="p-3 bg-purple-600 rounded-full">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">{chats.filter((c) => c.status === "active").length}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-white">{chats.reduce((sum, chat) => sum + chat.messageCount, 0)}</p>
            </div>
            <div className="p-3 bg-pink-600 rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Chats Grid */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {searchQuery || filterModel !== "all" ? "No chats found" : "No AI chats yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterModel !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start your first AI chat to get personalized tutoring"}
          </p>
          {!searchQuery && filterModel === "all" && (
            <Link href="/chats/new">
              <MagneticButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Start Your First Chat
              </MagneticButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredChats.map((chat) => (
            <Link key={chat.id} href={`/chats/${chat.id}`}>
              <AnimatedCard className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors duration-200 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl font-semibold text-white">{chat.title}</CardTitle>
                        <Badge className={`text-xs ${getModelColor(chat.model)}`}>{chat.model}</Badge>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{chat.lastMessage}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-zinc-700"
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle menu action
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-400">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {chat.messageCount} messages
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Bot className="w-4 h-4 mr-1" />
                        {chat.model}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {chat.timestamp}
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
