'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Role } from '@prisma/client'
import { logout } from '@/actions/auth'
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  School,
  Plus,
  Calendar,
  LogOut,
  Settings,
  PartyPopper
} from 'lucide-react'

interface SidebarProps {
  role: Role
  universityName?: string
  logoUrl?: string | null
  onNavigate?: () => void
}

export function Sidebar({ role, universityName, logoUrl, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT],
    },
    {
      label: 'Universities',
      icon: School,
      href: '/dashboard/universities',
      roles: [Role.SUPER_ADMIN],
    },
    {
      label: 'Global Users',
      icon: Users,
      href: '/dashboard/users',
      roles: [Role.SUPER_ADMIN],
    },
    {
      label: 'Global Bookings',
      icon: ClipboardList,
      href: '/dashboard/bookings',
      roles: [Role.SUPER_ADMIN],
    },
    {
      label: 'Facilities',
      icon: Building2,
      href: '/dashboard/facilities',
      roles: [Role.ADMIN],
    },
    {
      label: 'Students',
      icon: Users,
      href: '/dashboard/students',
      roles: [Role.ADMIN],
    },
    {
      label: 'Bookings',
      icon: ClipboardList,
      href: '/dashboard/requests',
      roles: [Role.ADMIN],
    },
    {
      label: 'Campus Events',
      icon: PartyPopper,
      href: '/dashboard/events',
      roles: [Role.ADMIN, Role.STUDENT],
    },
    {
      label: 'Book a Facility',
      icon: Plus,
      href: '/dashboard/book',
      roles: [Role.STUDENT],
    },
    {
      label: 'My Bookings',
      icon: Calendar,
      href: '/dashboard/my-bookings',
      roles: [Role.STUDENT],
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      roles: [Role.ADMIN],
    },
    {
      label: 'Profile',
      icon: Users,
      href: '/dashboard/profile',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.STUDENT],
    },
  ]

  const filteredRoutes = routes.filter((route) => route.roles.includes(role))

  return (
    <div className="space-y-4 py-6 flex flex-col h-full text-zinc-600">
      <div className="px-4 flex-1">
        <Link href="/dashboard" className="flex items-center pl-2 mb-10 group" onClick={onNavigate}>
          {logoUrl && role !== Role.SUPER_ADMIN ? (
             <div className="relative h-9 w-9 mr-3 flex-shrink-0">
                <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain"
                />
             </div>
          ) : (
            <div className="h-8 w-8 bg-zinc-100 rounded-md mr-3 flex items-center justify-center text-zinc-900">
                <School className="h-5 w-5" />
            </div>
          )}
          <h1 className="text-lg font-bold tracking-tight text-zinc-900">
            {role === Role.SUPER_ADMIN ? 'BookMyCampus' : universityName}
          </h1>
        </Link>
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              className={cn(
                "text-sm group flex p-2.5 w-full justify-start font-medium cursor-pointer rounded-md transition-all duration-200",
                pathname === route.href 
                    ? "text-zinc-900 bg-zinc-100 font-semibold" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-4 w-4 mr-3", route.href === pathname ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 border-t border-zinc-100">
        <form action={logout}>
            <Button 
                variant="ghost" 
                className="w-full justify-start text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md h-auto py-2.5"
            >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
            </Button>
        </form>
      </div>
    </div>
  )
}
