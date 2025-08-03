"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Key, Bell, Shield, Trash2, Eye, EyeOff } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
  })

  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    studyReminders: true,
    weeklyProgress: true,
  })

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    timezone: "UTC-5",
  })

  const toggleApiKeyVisibility = (provider: keyof typeof showApiKeys) => {
    setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-400" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your account, API keys, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-700">
            Profile
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-zinc-700">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-zinc-700">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-zinc-700">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
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
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-gray-300">
                  Timezone
                </Label>
                <select
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC+0">UTC</option>
                </select>
              </div>
              <div className="flex justify-end">
                <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Changes
                </MagneticButton>
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-yellow-400" />
                API Keys
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect your API keys for unlimited AI usage at cost price
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">OpenAI</h3>
                      <p className="text-sm text-gray-400">GPT-4, GPT-3.5 Turbo</p>
                    </div>
                  </div>
                  <Badge className="bg-green-900 text-green-400 border-green-800">
                    {apiKeys.openai ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    type={showApiKeys.openai ? "text" : "password"}
                    placeholder="sk-..."
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => toggleApiKeyVisibility("openai")}
                  >
                    {showApiKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Anthropic */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Anthropic</h3>
                      <p className="text-sm text-gray-400">Claude 3.5 Sonnet, Claude 3 Opus</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-900 text-purple-400 border-purple-800">
                    {apiKeys.anthropic ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    type={showApiKeys.anthropic ? "text" : "password"}
                    placeholder="sk-ant-..."
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => toggleApiKeyVisibility("anthropic")}
                  >
                    {showApiKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Google */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Google</h3>
                      <p className="text-sm text-gray-400">Gemini Pro, Gemini Ultra</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-900 text-blue-400 border-blue-800">
                    {apiKeys.google ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    type={showApiKeys.google ? "text" : "password"}
                    placeholder="AIza..."
                    value={apiKeys.google}
                    onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => toggleApiKeyVisibility("google")}
                  >
                    {showApiKeys.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save API Keys
                </MagneticButton>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Security Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Your API keys are encrypted and stored securely. We never:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Store your keys in plain text</li>
                    <li>Share your keys with third parties</li>
                    <li>Use your keys for our own purposes</li>
                    <li>Log or monitor your API usage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-400" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to be notified about your study progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-400">Browser notifications for real-time updates</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Study Reminders</h3>
                  <p className="text-sm text-gray-400">Daily reminders to review your flashcards</p>
                </div>
                <Switch
                  checked={notifications.studyReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, studyReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Weekly Progress</h3>
                  <p className="text-sm text-gray-400">Weekly summary of your learning progress</p>
                </div>
                <Switch
                  checked={notifications.weeklyProgress}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyProgress: checked })}
                />
              </div>

              <div className="flex justify-end">
                <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Preferences
                </MagneticButton>
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <AnimatedCard className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Manage your account security and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Change Password</h3>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Current password"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="New password"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Update Password
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-300">
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Delete Account</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This will permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
