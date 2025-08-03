"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Clock, Filter, MoreVertical, BookOpen, Zap, TrendingUp } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { usePages } from "@/contexts/PagesContext"

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-900 text-green-400 border-green-800"
    case "completed":
      return "bg-blue-900 text-blue-400 border-blue-800"
    case "draft":
      return "bg-yellow-900 text-yellow-400 border-yellow-800"
    default:
      return "bg-gray-900 text-gray-400 border-gray-800"
  }
}

export default function PagesPage() {
  const { state, setSearchQuery, setFilterStatus, getFilteredPages, clearError } = usePages()
  const filteredPages = getFilteredPages()

  // Clear any errors when component mounts
  useEffect(() => {
    clearError()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "1 day ago"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Study Pages</h1>
          <p className="text-gray-400 mt-1">Organize and manage your AI-generated study materials</p>
        </div>
        <Link href="/pages/new">
          <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </MagneticButton>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pages..."
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={state.filterStatus === "all" ? "default" : "outline"}
            className={`${
              state.filterStatus === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={state.filterStatus === "active" ? "default" : "outline"}
            className={`${
              state.filterStatus === "active"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={state.filterStatus === "completed" ? "default" : "outline"}
            className={`${
              state.filterStatus === "completed"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
          <Button
            variant={state.filterStatus === "draft" ? "default" : "outline"}
            className={`${
              state.filterStatus === "draft"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
            }`}
            onClick={() => setFilterStatus("draft")}
          >
            Draft
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{state.error}</p>
        </div>
      )}

      {/* Loading State */}
      {state.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {state.pages.length === 0 ? "No Study Pages Yet" : "No Pages Match Your Search"}
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {state.pages.length === 0 
              ? "Create your first study page to get started with AI-generated materials."
              : "Try adjusting your search query or filters to find what you're looking for."
            }
          </p>
          {state.pages.length === 0 && (
            <Link href="/pages/new">
              <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Page
              </MagneticButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPages.map((page) => (
            <Link key={page.id} href={`/pages/${page.id}`}>
              <AnimatedCard className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors duration-200 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl font-semibold text-white">{page.title}</CardTitle>
                        <Badge className={`text-xs ${getStatusColor(page.status)}`}>{page.status}</Badge>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{page.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-zinc-700"
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Handle menu action (edit, delete, share)
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6 text-gray-400">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {page.counts?.files || 0} files
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        {page.counts?.flashcards || 0} flashcards
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {page.counts?.studyGuides || 0} guides
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(page.updatedAt)}
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
