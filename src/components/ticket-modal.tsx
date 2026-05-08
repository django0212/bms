'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TicketIcon } from 'lucide-react'
import { TicketView } from '@/components/dashboard/ticket-view'

interface TicketModalProps {
  booking: any
  universityName: string
  universityLogo?: string | null
  primaryColor?: string | null
}

export function TicketModal({ booking, universityName, universityLogo, primaryColor }: TicketModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
            <TicketIcon className="h-4 w-4" />
            Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none flex items-center justify-center">
        <DialogTitle className="sr-only">Ticket Details</DialogTitle>
        <div className="transform scale-100 transition-transform">
            <TicketView 
                booking={booking} 
                universityName={universityName} 
                universityLogo={universityLogo || undefined} 
                primaryColor={primaryColor || undefined} 
            />
        </div>
      </DialogContent>
    </Dialog>
  )
}
