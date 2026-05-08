'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Role } from '@prisma/client'
import { ChevronRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileSidebarProps {
  role: Role
  universityName?: string
  logoUrl?: string | null
}

export function MobileSidebar({ role, universityName, logoUrl }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Thin Strip - Always visible on mobile */}
      <div className="fixed inset-y-0 left-0 z-50 w-12 bg-white border-r border-zinc-200 flex flex-col items-center py-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-10 w-10 text-zinc-500 hover:text-zinc-900"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar 
          role={role} 
          universityName={universityName} 
          logoUrl={logoUrl} 
          onNavigate={() => setIsOpen(false)}
        />
      </div>
    </>
  )
}
