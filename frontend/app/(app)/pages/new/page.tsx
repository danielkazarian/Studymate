"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, FileText, ImageIcon, File, X } from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { usePages } from "@/contexts/PagesContext"

export default function NewPagePage() {
  const router = useRouter()
  const { createPage, state } = usePages()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (file.type === "application/pdf") return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the page first
      const newPage = await createPage(formData.title.trim(), formData.description.trim())
      
      // TODO: Upload files to the page (this would require implementing file upload API)
      // For now, we'll just navigate to the page
      if (files.length > 0) {
        console.log(`TODO: Upload ${files.length} files to page ${newPage.id}`)
      }

      // Navigate to the new page
      router.push(`/pages/${newPage.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to create page")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/pages">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pages
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Study Page</h1>
            <p className="text-gray-400 mt-1">Upload materials and generate AI-powered study content</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Page Details Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Page Details</CardTitle>
            <CardDescription className="text-gray-400">
              Provide basic information about your study page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Calculus I - Derivatives"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this page covers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-4">
                <MagneticButton
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Page"}
                </MagneticButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/pages')}
                  className="border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Upload Study Materials</CardTitle>
            <CardDescription className="text-gray-400">
              Add PDFs, images, or text files to generate AI content (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Drop files here</h3>
              <p className="text-gray-400 mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
              />
              <label htmlFor="file-upload">
                <Button asChild variant="outline" className="border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-700">
                  <span>Choose Files</span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supports PDF, images, text files, and Word documents
              </p>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Uploaded Files</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Files will be processed and text extracted</li>
                <li>• AI will generate flashcards, study guides, and tests</li>
                <li>• You can chat with AI about your materials</li>
                <li>• Content can be customized and edited later</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
