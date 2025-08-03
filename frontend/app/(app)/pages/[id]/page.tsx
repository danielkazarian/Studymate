"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Brain, Play, Download, Share, MoreVertical, Clock, Zap, Target } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

// Mock data for a specific page
const pageData = {
  id: "1",
  title: "Calculus I - Derivatives",
  description: "Comprehensive study guide covering limits, derivatives, and applications",
  status: "active",
  progress: 75,
  lastModified: "2 hours ago",
  createdAt: "1 week ago",
  materialsCount: 12,
  flashcardsCount: 45,
  quizzesCount: 8,
  studyGuides: 3,
}

const materials = [
  { id: "1", name: "Calculus Textbook Chapter 3.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "1 week ago" },
  { id: "2", name: "Derivative Rules Notes.txt", type: "text", size: "15 KB", uploadedAt: "6 days ago" },
  { id: "3", name: "Practice Problems.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "5 days ago" },
]

const flashcards = [
  { id: "1", front: "What is the derivative of x²?", back: "2x", difficulty: "easy", lastReviewed: "1 hour ago" },
  {
    id: "2",
    front: "State the chain rule",
    back: "If f(x) = g(h(x)), then f'(x) = g'(h(x)) × h'(x)",
    difficulty: "medium",
    lastReviewed: "2 hours ago",
  },
  {
    id: "3",
    front: "What is the derivative of sin(x)?",
    back: "cos(x)",
    difficulty: "easy",
    lastReviewed: "1 day ago",
  },
]

const quizzes = [
  { id: "1", title: "Basic Derivatives", questions: 10, score: 85, completedAt: "2 days ago" },
  { id: "2", title: "Chain Rule Practice", questions: 15, score: 92, completedAt: "1 day ago" },
  { id: "3", title: "Applications of Derivatives", questions: 12, score: null, completedAt: null },
]

export default function PageDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900 text-green-400 border-green-800"
      case "medium":
        return "bg-yellow-900 text-yellow-400 border-yellow-800"
      case "hard":
        return "bg-red-900 text-red-400 border-red-800"
      default:
        return "bg-gray-900 text-gray-400 border-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/pages">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </Link>
      </div>

      {/* Page Info */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h1 className="text-3xl font-bold text-white">{pageData.title}</h1>
            <Badge className="bg-blue-900 text-blue-400 border-blue-800">{pageData.status}</Badge>
          </div>
          <p className="text-gray-400 text-lg mb-4">{pageData.description}</p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Overall Progress</span>
              <span className="text-sm font-bold text-white">{pageData.progress}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${pageData.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Last modified {pageData.lastModified}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Created {pageData.createdAt}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <MagneticButton variant="outline" className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent">
            <Share className="w-4 h-4 mr-2" />
            Share
          </MagneticButton>
          <MagneticButton variant="outline" className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </MagneticButton>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-zinc-800">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{pageData.materialsCount}</div>
          <div className="text-sm text-gray-400">Materials</div>
        </AnimatedCard>
        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{pageData.flashcardsCount}</div>
          <div className="text-sm text-gray-400">Flashcards</div>
        </AnimatedCard>
        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{pageData.quizzesCount}</div>
          <div className="text-sm text-gray-400">Quizzes</div>
        </AnimatedCard>
        <AnimatedCard className="bg-zinc-900 border-zinc-800 p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{pageData.studyGuides}</div>
          <div className="text-sm text-gray-400">Study Guides</div>
        </AnimatedCard>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="materials" className="data-[state=active]:bg-zinc-700">
            Materials
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="data-[state=active]:bg-zinc-700">
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-zinc-700">
            Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <AnimatedCard className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MagneticButton className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Flashcard Session
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  className="w-full border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate New Quiz
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  className="w-full border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Practice Weak Areas
                </MagneticButton>
              </CardContent>
            </AnimatedCard>

            {/* Recent Activity */}
            <AnimatedCard className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Completed Chain Rule Quiz</div>
                    <div className="text-xs text-gray-400">Score: 92% • 1 day ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Reviewed 15 flashcards</div>
                    <div className="text-xs text-gray-400">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Added practice problems</div>
                    <div className="text-xs text-gray-400">5 days ago</div>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {materials.map((material) => (
            <AnimatedCard key={material.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">{material.name}</div>
                      <div className="text-sm text-gray-400">
                        {material.size} • Uploaded {material.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          {flashcards.map((flashcard) => (
            <AnimatedCard key={flashcard.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-2">{flashcard.front}</div>
                    <div className="text-gray-400 text-sm">{flashcard.back}</div>
                  </div>
                  <Badge className={`ml-4 ${getDifficultyColor(flashcard.difficulty)}`}>{flashcard.difficulty}</Badge>
                </div>
                <div className="text-xs text-gray-500">Last reviewed {flashcard.lastReviewed}</div>
              </CardContent>
            </AnimatedCard>
          ))}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {quizzes.map((quiz) => (
            <AnimatedCard key={quiz.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{quiz.title}</div>
                    <div className="text-sm text-gray-400">{quiz.questions} questions</div>
                  </div>
                  <div className="text-right">
                    {quiz.score ? (
                      <div>
                        <div className="font-bold text-white">{quiz.score}%</div>
                        <div className="text-xs text-gray-400">Completed {quiz.completedAt}</div>
                      </div>
                    ) : (
                      <MagneticButton size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Start Quiz
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
