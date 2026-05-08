'use client'

import { Ticket } from '@/components/ticket'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface TicketClientProps {
  booking: any
  universityName: string
  universityLogo?: string | null
  primaryColor?: string | null
}

export default function TicketClient({ booking, universityName, universityLogo, primaryColor }: TicketClientProps) {
  const handlePrint = () => {
    window.open(`/print/tickets/${booking.id}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Your Pass</h2>
          <p className="text-slate-500">
            Present this ticket at the facility entrance.
          </p>
        </div>

        <div className="transform transition-all hover:scale-[1.02] duration-300">
          <Ticket 
            booking={booking}
            universityName={universityName}
            universityLogo={universityLogo}
            primaryColor={primaryColor}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
            <Button onClick={handlePrint} className="gap-2 w-full sm:w-auto">
                <Printer className="h-4 w-4" />
                Print Ticket
            </Button>
            
            <div className="text-center text-xs text-slate-400">
                <p>Ticket ID: {booking.id}</p>
                <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
        </div>
      </div>
    </div>
  )
}
