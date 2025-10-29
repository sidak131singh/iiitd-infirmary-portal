"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Calendar, ClipboardList, Home, LogOut, Menu, Settings, User } from "lucide-react"

interface HeaderProps {
  userType: "student" | "doctor" | "admin"
  userName?: string
}

export function Header({ userType, userName = "User" }: HeaderProps) {
  const pathname = usePathname()
  // const router = useRouter()
  // const [notificationCount, setNotificationCount] = useState(3)

  const navigationLinks = {
    student: [
      { name: "Dashboard", href: "/student/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "Appointments", href: "/student/appointments", icon: <Calendar className="h-5 w-5" /> },
      { name: "Prescriptions", href: "/student/prescriptions", icon: <ClipboardList className="h-5 w-5" /> },
      { name: "Profile", href: "/student/profile", icon: <User className="h-5 w-5" /> },
    ],
    doctor: [
      { name: "Dashboard", href: "/doctor/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "Appointments", href: "/doctor/appointments", icon: <Calendar className="h-5 w-5" /> },
      { name: "Leave Management", href: "/doctor/leave", icon: <Calendar className="h-5 w-5" /> },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "Appointments", href: "/admin/appointments", icon: <Calendar className="h-5 w-5" /> },
      { name: "Students", href: "/admin/students", icon: <User className="h-5 w-5" /> },
      { name: "Doctors", href: "/admin/doctors", icon: <User className="h-5 w-5" /> },
      { name: "Pharmacy", href: "/admin/pharmacy", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  }

  const links = navigationLinks[userType]

  const colorScheme = {
    student: "blue",
    doctor: "green",
    admin: "purple",
  }[userType]

  const handleLogout = async () => {
    // Clear any client-side data
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear()
      // Clear sessionStorage
      sessionStorage.clear()
      // Disable back button functionality
      window.history.pushState(null, '', window.location.href)
    }
    
    await signOut({ 
      callbackUrl: "/login?signout=true",
      redirect: true 
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="IIIT Delhi Logo"
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                  <span className="text-lg font-semibold text-gray-900">IIIT Delhi Infirmary</span>
                </div>
                <nav className="flex flex-col gap-2">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-blue-100 text-blue-900 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href={`/${userType}/dashboard`} className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="IIIT Delhi Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="hidden font-semibold text-gray-900 md:inline-block">IIIT Delhi Infirmary</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-900 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {notificationCount}
              </span>
            )}
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${userType}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${userType}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
