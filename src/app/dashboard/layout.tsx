import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { UniversityProvider } from '@/contexts/university-context'
import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'
import { DashboardNav } from '@/components/dashboard-nav'
import { ChatBot } from '@/components/chat-bot'

function hexToHsl(hex: string) {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '')

  // Parse the hex values
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  // Convert RGB to HSL
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

import { MobileSidebar } from '@/components/mobile-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get university ID from cookie
  const cookieStore = await cookies()
  const universityId = cookieStore.get('university_id')?.value
  const user = await getCurrentUser()

  if (!universityId || !user) {
    redirect('/login')
  }

  // Fetch university details
  const university = await prisma.university.findUnique({
    where: { id: universityId },
  })

  if (!university) {
    // Cookie is invalid, redirect to login
    redirect('/login')
  }

  let cssVariables = {} as React.CSSProperties
  
  if (university.primaryColor) {
    const { h, s, l } = hexToHsl(university.primaryColor)
    const primaryHsl = `${h} ${s}% ${l}%`
    
    // Foreground text color based on lightness
    const foregroundHsl = l > 60 ? '0 0% 0%' : '0 0% 100%'

    // Sidebar colors: Very light version of primary for background, dark for text
    const sidebarBackgroundHsl = `${h} ${Math.max(s - 30, 10)}% 96%`
    const sidebarForegroundHsl = `${h} ${Math.min(s + 20, 100)}% 15%`

    cssVariables = {
      '--primary': primaryHsl,
      '--primary-foreground': foregroundHsl,
      '--ring': primaryHsl,
      '--sidebar-background': sidebarBackgroundHsl,
      '--sidebar-foreground': sidebarForegroundHsl,
    } as React.CSSProperties
  } else {
    // Default fallback if no primary color
    cssVariables = {
        '--sidebar-background': '210 40% 96.1%', // slate-50 equivalent
        '--sidebar-foreground': '222.2 84% 4.9%', // slate-900 equivalent
    } as React.CSSProperties
  }

  return (
    <UniversityProvider university={university}>
      <div
        className="h-full relative bg-[#fafafa]"
        style={cssVariables}
      >
        {/* Desktop Sidebar */}
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white border-r border-zinc-200">
          <Sidebar 
            role={user.role} 
            universityName={university.name} 
            logoUrl={university.logoUrl} 
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar 
            role={user.role} 
            universityName={university.name} 
            logoUrl={university.logoUrl} 
        />

        <main className="md:pl-72 pl-12 pb-10 min-h-screen">
          <div className="container mx-auto px-4 md:px-8 pt-8 max-w-7xl">
            <DashboardNav />
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </div>
          </div>
          <ChatBot />
        </main>
      </div>
    </UniversityProvider>
  )
}
