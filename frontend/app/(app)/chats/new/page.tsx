"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Bot, Sparkles } from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

const aiModels = [
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Most capable model for complex reasoning and analysis",
    strengths: ["Complex problem solving", "Code generation", "Creative writing"],
    color: "bg-green-900 text-green-400 border-green-800",
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    description: "Excellent for detailed explanations and ethical reasoning",
    strengths: ["Detailed explanations", "Research assistance", "Ethical reasoning"],
    color: "bg-purple-900 text-purple-400 border-purple-800",
  },
  {
    id: "gemini",
    name: "Gemini",
    provider: "Google",
    description: "Great for multimodal tasks and real-time information",
    strengths: ["Multimodal analysis", "Real-time info", "Language translation"],
    color: "bg-blue-900 text-blue-400 border-blue-800",
  },
]

export default function NewChatPage() {
  const router = useRouter()
  const [selectedModel, setSelectedModel] = useState("")

  const handleStartChat = () => {
    if (selectedModel) {
      // In a real app, create the chat and redirect
      console.log("Starting chat with:", selectedModel)
      router.push("/chats")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/chats">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chats
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Start New AI Chat</h1>
          <p className="text-gray-400">Choose an AI model to begin your conversation</p>
        </div>
      </div>

      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">AI-Powered Tutoring</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Get personalized help from AI tutors
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Each AI model has unique strengths. Choose the one that best fits your learning needs.
        </p>
      </div>

      <div className="grid gap-6">
        {aiModels.map((model) => (
          <AnimatedCard
            key={model.id}
            className={`cursor-pointer transition-all duration-200 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 ${
              selectedModel === model.id ? "ring-2 ring-purple-500 border-purple-500" : ""
            }`}
            onClick={() => setSelectedModel(model.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <Bot className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white flex items-center space-x-3">
                      <span>{model.name}</span>
                      <Badge className={`text-xs ${model.color}`}>{model.provider}</Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">{model.description}</CardDescription>
                  </div>
                </div>
                {selectedModel === model.id && (
                  <div className="p-2 bg-purple-600 rounded-full">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Best for:</h4>
                  <div className="flex flex-wrap gap-2">
                    {model.strengths.map((strength, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-zinc-700 text-gray-400">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <MagneticButton
          onClick={handleStartChat}
          disabled={!selectedModel}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 px-8 py-3"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Start Chat
        </MagneticButton>
      </div>
    </div>
  )
}
