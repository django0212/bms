'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show on the main dashboard page
  if (pathname === '/dashboard') {
    return null
  }

  const getBackLabel = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    // Special case for tickets
    if (segments.includes('tickets')) {
        return 'My Bookings'
    }

    // If we are at /dashboard/[segment], parent is Dashboard
    if (segments.length === 2) {
      return 'Dashboard'
    }

    const parentSegment = segments[segments.length - 2]

    // Check if parent segment looks like an ID (UUID or CUID)
    // UUID: 36 chars, CUID: 25 chars (starts with c), or just long alphanumeric
    const isId = parentSegment.length > 20 || /^[0-9a-f-]+$/.test(parentSegment)

    if (isId) {
        // If parent is an ID, we are likely in a sub-page of a resource (e.g. .../facilities/[id]/edit)
        // We want to show "Back to Facility" instead of "Back to [id]"
        // Get grandparent segment
        const grandparentSegment = segments[segments.length - 3]
        if (grandparentSegment) {
            // Simple singularization: remove trailing 's'
            // e.g. facilities -> Facility, universities -> University
            let singular = grandparentSegment
            if (singular.endsWith('ies')) {
                singular = singular.slice(0, -3) + 'y'
            } else if (singular.endsWith('s')) {
                singular = singular.slice(0, -1)
            }
            return singular.charAt(0).toUpperCase() + singular.slice(1)
        }
        return 'Previous Page'
    }

    return parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)
  }

  const handleBack = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    // Special case for tickets
    if (segments.includes('tickets')) {
        router.push('/dashboard/my-bookings')
        return
    }
    
    // Special case for facilities (since /dashboard/facilities/[id] doesn't exist)
    if (segments.includes('facilities') && segments.length > 2) {
        router.push('/dashboard/facilities')
        return
    }
    
    if (segments.length === 2) {
      router.push('/dashboard')
      return
    }

    const parentPath = '/' + segments.slice(0, -1).join('/')
    router.push(parentPath)
  }

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {getBackLabel()}
      </Button>
    </div>
  )
}
