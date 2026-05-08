'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface WaitlistCardProps {
  entry: {
    id: string
    facility: {
      name: string
      type: string
      location?: string | null
    }
    startTime: string
    endTime: string
  }
}

export function WaitlistCard({ entry }: WaitlistCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLeave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/waitlist/${entry.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to leave waitlist')

      toast({
        title: "Left Waitlist",
        description: "You have been removed from the waitlist.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave waitlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
                <h4 className="font-semibold text-zinc-900 text-lg tracking-tight">{entry.facility.name}</h4>
                {entry.facility.location && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {entry.facility.location}
                    </div>
                )}
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                entry.facility.type === 'PHYSICAL' ? 'bg-blue-50 text-blue-600' :
                entry.facility.type === 'EVENT' ? 'bg-purple-50 text-purple-600' :
                'bg-emerald-50 text-emerald-600'
            }`}>
                {entry.facility.type === 'TRANSPORT' ? <MapPin className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
            </div>
        </div>

        <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{format(new Date(entry.startTime), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span>
                    {format(new Date(entry.startTime), 'h:mm a')} - {format(new Date(entry.endTime), 'h:mm a')}
                </span>
            </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                Waitlisted
            </span>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 transition-colors"
                onClick={handleLeave}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="text-xs">Leaving...</span>
                ) : (
                    <>
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Leave</span>
                    </>
                )}
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
