"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brain, Home, FileText, MessageSquare, Settings, User, LogOut, Plus, Sparkles, TrendingUp } from "lucide-react"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Study Pages", href: "/pages", icon: FileText },
  { name: "AI Chats", href: "/chats", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state, logout } = useAuth()
  
  const user = state.user || {
    name: "User",
    email: "user@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="relative">
            <Brain className="h-8 w-8 text-white transition-transform duration-300" />
            <Sparkles className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            StudyMate
          </span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="space-y-2">
          <Link href="/pages/new">
            <MagneticButton
              size="sm"
              className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </MagneticButton>
          </Link>
          <Link href="/chats/new">
            <MagneticButton
              size="sm"
              variant="outline"
              className="w-full justify-start border-zinc-700 text-purple-400 hover:bg-zinc-800 bg-transparent"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </MagneticButton>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800",
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Stats */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="bg-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">This Week</span>
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-white">12</div>
              <div className="text-gray-400">Pages</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">8</div>
              <div className="text-gray-400">Chats</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Menu */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 hover:bg-zinc-800 transition-colors duration-200"
            >
              <Avatar className="h-8 w-8 mr-3 border-2 border-zinc-700">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                <p className="text-xs leading-none text-gray-400">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild className="hover:bg-zinc-800 transition-colors text-gray-300 hover:text-white">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4 text-blue-400" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-zinc-800 transition-colors text-gray-300 hover:text-white">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4 text-purple-400" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              className="hover:bg-zinc-800 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
