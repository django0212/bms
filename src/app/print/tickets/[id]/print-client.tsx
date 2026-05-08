'use client'

import { Ticket } from '@/components/ticket'
import { useEffect } from 'react'

interface PrintClientProps {
  booking: any
  universityName: string
  universityLogo?: string | null
  primaryColor?: string | null
}

export default function PrintClient({ booking, universityName, universityLogo, primaryColor }: PrintClientProps) {
  useEffect(() => {
    // Auto-trigger print when the component mounts
    const timer = setTimeout(() => {
      window.print()
    }, 500) // Small delay to ensure styles/images load

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Ticket Section */}
        <div className="transform scale-100 origin-top">
          <Ticket 
            booking={booking}
            universityName={universityName}
            universityLogo={universityLogo}
            primaryColor={primaryColor}
          />
        </div>

        {/* Regulator / Footer Information */}
        <div className="text-center space-y-4 pt-8 border-t border-slate-100">
            <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Official Booking Document</p>
                <p className="text-[10px] text-slate-500">
                    This ticket is electronically generated and valid for entry.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 text-left max-w-xs mx-auto">
                <div>
                    <span className="block font-semibold text-slate-600">Issued By</span>
                    BookMyCampus System
                </div>
                <div>
                    <span className="block font-semibold text-slate-600">Verification</span>
                    QR Code Scan Required
                </div>
                <div>
                    <span className="block font-semibold text-slate-600">Date Issued</span>
                    {new Date().toLocaleDateString()}
                </div>
                <div>
                    <span className="block font-semibold text-slate-600">Booking Ref</span>
                    {booking.id.substring(0, 8).toUpperCase()}
                </div>
            </div>

            <p className="text-[9px] text-slate-300 pt-4">
                &copy; {new Date().getFullYear()} {universityName}. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  )
}
