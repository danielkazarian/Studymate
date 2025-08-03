"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera, Calendar, MapPin, BookOpen, Trophy, TrendingUp, Zap } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Computer Science student passionate about AI and machine learning. Always looking to learn something new!",
    location: "San Francisco, CA",
    university: "Stanford University",
    major: "Computer Science",
    graduationYear: "2025",
    avatar: "/placeholder.svg?height=128&width=128",
  })

  const stats = [
    { label: "Study Pages", value: "12", icon: BookOpen, color: "text-blue-400" },
    { label: "AI Chats", value: "8", icon: Zap, color: "text-purple-400" },
    { label: "Flashcards", value: "251", icon: Trophy, color: "text-green-400" },
    { label: "Study Streak", value: "7 days", icon: TrendingUp, color: "text-pink-400" },
  ]

  const achievements = [
    { name: "First Page", description: "Created your first study page", earned: true },
    { name: "Chat Master", description: "Had 10 AI conversations", earned: true },
    { name: "Flashcard Pro", description: "Created 100+ flashcards", earned: true },
    { name: "Study Streak", description: "7-day study streak", earned: true },
    { name: "Quiz Champion", description: "Scored 90%+ on 5 quizzes", earned: false },
    { name: "Knowledge Seeker", description: "Used all 3 AI models", earned: false },
  ]

  const handleSave = () => {
    // Handle profile update
    console.log("Saving profile:", profile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset changes
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <User className="w-8 h-8 mr-3 text-blue-400" />
          Profile
        </h1>
        <p className="text-gray-400 mt-1">Manage your personal information and view your learning progress</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-gray-400 hover:bg-zinc-800 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <MagneticButton
                      onClick={handleSave}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Save
                    </MagneticButton>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-zinc-700">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <p className="text-gray-400">{profile.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-gray-300">
                    University
                  </Label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major" className="text-gray-300">
                    Major
                  </Label>
                  <Input
                    id="major"
                    value={profile.major}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="text-gray-300">
                    Graduation Year
                  </Label>
                  <Input
                    id="graduationYear"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                  rows={3}
                />
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Achievements */}
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-gray-400">Your learning milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors ${
                      achievement.earned
                        ? "bg-yellow-900/20 border-yellow-800"
                        : "bg-zinc-800 border-zinc-700 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{achievement.name}</h3>
                      {achievement.earned && <Trophy className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Learning Stats</CardTitle>
              <CardDescription className="text-gray-400">Your progress at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-zinc-700 rounded-lg">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">January 2024</div>
                <div className="text-sm text-gray-400">6 months of learning</div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800">
            <CardHeader>
              <CardTitle className="text-white">Study Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  7 Days
                </div>
                <div className="text-sm text-gray-400 mb-4">Keep it up! You're on fire 🔥</div>
                <div className="flex justify-center space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
