'use client'

import { useState, useEffect } from 'react'
import { BookingStatus } from '@prisma/client'
import { Facility } from '@prisma/client'
import { createBooking } from '@/actions/student-bookings'
import { getOccupiedSeats } from '@/actions/student-bookings'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isBefore, startOfToday, addHours } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Bus, Calendar as CalendarIcon, Clock, Dumbbell, MapPin, CheckCircle2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BookingFormProps {
  facility: Facility
  userId: string
  universityId: string
  blackoutDates?: { date: Date; reason: string | null }[]
}

export default function BookingForm({ facility, userId, universityId, blackoutDates = [] }: BookingFormProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [pickupStop, setPickupStop] = useState<string>('')
  const [dropoffStop, setDropoffStop] = useState<string>('')
  const [guestCount, setGuestCount] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceCount, setRecurrenceCount] = useState('4')
  const [isLoading, setIsLoading] = useState(false)
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([])
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false)
  const [waitlistError, setWaitlistError] = useState('')

  // ... existing parseCycles ...
  const parseCycles = (hoursString: string | null) => {
    if (!hoursString) return []
    return hoursString.split(',').map(s => {
        const trimmed = s.trim()
        if (/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(trimmed)) {
            return trimmed
        }
        return null
    }).filter(Boolean) as string[]
  }

  const cycles = parseCycles(facility.operatingHours)

  // ... existing useEffect ...
  useEffect(() => {
    const fetchOccupied = async () => {
        if (facility.type === 'TRANSPORT' && date && selectedCycle) {
            const [startStr, endStr] = selectedCycle.split('-')
            const [sh, sm] = startStr.split(':').map(Number)
            const [eh, em] = endStr.split(':').map(Number)

            const startDateTime = new Date(date)
            startDateTime.setHours(sh, sm, 0, 0)
            
            const endDateTime = new Date(date)
            endDateTime.setHours(eh, em, 0, 0)
            
            const occupied = await getOccupiedSeats(facility.id, startDateTime, endDateTime)
            setOccupiedSeats(occupied)
            
            if (selectedSeat && occupied.includes(selectedSeat)) {
                setSelectedSeat(null)
            }
        }
    }
    fetchOccupied()
  }, [facility, date, selectedCycle, selectedSeat])

  const handleCycleSelect = (cycle: string) => {
      setSelectedCycle(cycle)
      const [startStr, endStr] = cycle.split('-')
      setStartTime(startStr)
      setEndTime(endStr)
      setSelectedSeat(null)
  }

  const handleJoinWaitlist = async () => {
    if (!date || !startTime) return
    setIsLoading(true)
    try {
        const startDateTime = new Date(date)
        const [startHours, startMinutes] = startTime.split(':').map(Number)
        startDateTime.setHours(startHours, startMinutes, 0, 0)

        let endDateTime = new Date(date)
        if (facility.type === 'TRANSPORT' && selectedCycle) {
            const [_, endStr] = selectedCycle.split('-')
            const [eh, em] = endStr.split(':').map(Number)
            endDateTime.setHours(eh, em, 0, 0)
        } else if (endTime) {
            const [endHours, endMinutes] = endTime.split(':').map(Number)
            endDateTime.setHours(endHours, endMinutes, 0, 0)
        } else {
             // Fallback
             endDateTime = addHours(startDateTime, 1)
        }

        const res = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                facilityId: facility.id,
                universityId,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            })
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Failed to join waitlist')

        toast.success("Joined Waitlist", {
            description: "You will be notified if a slot opens up.",
        })
        setShowWaitlistDialog(false)
        router.refresh()
    } catch (error: any) {
        toast.error("Error", {
            description: error.message,
        })
    } finally {
        setIsLoading(false)
    }
  }

  const handleBook = async () => {
    if (!date || !startTime) return

    // Check blackout dates
    const isBlackout = blackoutDates.some(bd => {
        const bdDate = new Date(bd.date)
        return bdDate.toDateString() === date.toDateString()
    })

    if (isBlackout) {
        toast.error("Date Unavailable", {
            description: "The selected date is blocked (e.g. Holiday or Maintenance).",
        })
        return
    }

    // Time Validation
    if (facility.type !== 'TRANSPORT' && startTime && endTime) {
        const [startH, startM] = startTime.split(':').map(Number)
        const [endH, endM] = endTime.split(':').map(Number)
        
        const startTotal = startH * 60 + startM
        const endTotal = endH * 60 + endM

        if (endTotal <= startTotal) {
            toast.error("Invalid Time Range", {
                description: "End time must be after start time.",
            })
            return
        }

        // Check for past time if date is today
        if (date && date.toDateString() === new Date().toDateString()) {
            const now = new Date()
            const currentTotal = now.getHours() * 60 + now.getMinutes()
            
            if (startTotal < currentTotal) {
                toast.error("Invalid Time", {
                    description: "Cannot book a time slot in the past.",
                })
                return
            }
        }
    }

    if (facility.type === 'EVENT' && facility.capacity && guestCount) {
        if (parseInt(guestCount) > facility.capacity) {
            toast.error("Capacity Exceeded", {
                description: `Guest count cannot exceed the facility capacity of ${facility.capacity}.`,
            })
            return
        }
    }

    setIsLoading(true)
    try {
      const startDateTime = new Date(date)
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      startDateTime.setHours(startHours, startMinutes, 0, 0)

      let endDateTime = new Date(date)
      if (facility.type === 'TRANSPORT') {
        if (selectedCycle) {
            const [_, endStr] = selectedCycle.split('-')
            const [eh, em] = endStr.split(':').map(Number)
            endDateTime.setHours(eh, em, 0, 0)
        } else {
             endDateTime = addHours(startDateTime, 1)
        }
      } else {
        if (!endTime) throw new Error('End time is required')
        const [endHours, endMinutes] = endTime.split(':').map(Number)
        endDateTime.setHours(endHours, endMinutes, 0, 0)

        // Validate against operating hours if present
        if (cycles.length > 0) {
            const startMinutesTotal = startHours * 60 + startMinutes
            const endMinutesTotal = endHours * 60 + endMinutes

            const isWithinHours = cycles.some(cycle => {
                const [startStr, endStr] = cycle.split('-')
                const [sh, sm] = startStr.split(':').map(Number)
                const [eh, em] = endStr.split(':').map(Number)
                
                const cycleStart = sh * 60 + sm
                const cycleEnd = eh * 60 + em
                
                return startMinutesTotal >= cycleStart && endMinutesTotal <= cycleEnd
            })

            if (!isWithinHours) {
                throw new Error(`Selected time is outside operating hours (${facility.operatingHours})`)
            }
        }
      }

      const result = await createBooking({
        userId,
        facilityId: facility.id,
        universityId,
        startTime: startDateTime,
        endTime: endDateTime,
        seatNumber: selectedSeat || undefined,
        pickupStop: pickupStop || undefined,
        dropoffStop: dropoffStop || undefined,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
        specialRequests: specialRequests || undefined,
        recurrenceRule: isRecurring ? `WEEKLY:${recurrenceCount}` : undefined,
      })

      if (!result.success) {
          throw new Error(result.error)
      }

      router.push('/dashboard/my-bookings')
      router.refresh()
      toast.success("Success", {
        description: "Booking confirmed successfully!",
      })
    } catch (error: any) {
      console.error(error)
      if (error.message.includes('fully booked') || error.message.includes('Bus is full')) {
          setWaitlistError(error.message)
          setShowWaitlistDialog(true)
      } else {
          toast.error("Error", {
            description: error.message || "Failed to book facility.",
          })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'PHYSICAL':
        return <Dumbbell className="h-6 w-6 text-blue-500" />
      case 'EVENT':
        return <CalendarIcon className="h-6 w-6 text-purple-500" />
      case 'TRANSPORT':
        return <Bus className="h-6 w-6 text-green-500" />
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-100 rounded-full">
            {getIcon(facility.type)}
        </div>
        <div>
            <h1 className="text-3xl font-bold">{facility.name}</h1>
            <p className="text-muted-foreground">{facility.description}</p>
            {facility.amenities && typeof facility.amenities === 'object' && Object.keys(facility.amenities as Record<string, any>).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(facility.amenities as Record<string, any>).map(([key, value], i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-zinc-100 px-2.5 py-1 rounded-full text-zinc-700 border border-zinc-200">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            {key}: {String(value)}
                        </span>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={[
                      (date: Date) => isBefore(date, startOfToday()),
                      ...blackoutDates.map(bd => new Date(bd.date))
                  ]}
                  initialFocus
                  className="rounded-md border"
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Configure your reservation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {facility.type === 'TRANSPORT' ? (
                    <div className="space-y-6">
                        {/* Operating Hours / Cycles */}
                        <div className="space-y-3">
                            <Label>Select Time Slot</Label>
                            {cycles.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {cycles.map((cycle) => (
                                        <Button
                                            key={cycle}
                                            type="button"
                                            variant={selectedCycle === cycle ? "default" : "outline"}
                                            onClick={() => handleCycleSelect(cycle)}
                                            className={cn(
                                                "h-auto py-3 flex flex-col gap-1",
                                                selectedCycle === cycle && "border-primary"
                                            )}
                                        >
                                            <Clock className="h-4 w-4 mb-1" />
                                            <span className="text-sm font-medium">{cycle}</span>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No operating hours defined.</p>
                            )}
                        </div>

                        {/* Stops */}
                        {(facility.transportConfig as any)?.stops?.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pick-up Stop</Label>
                                    <Select onValueChange={(val) => {
                                        setPickupStop(val)
                                        // Reset dropoff if it becomes invalid (optional, but good UX)
                                        const stops = (facility.transportConfig as any)?.stops || []
                                        const pickupIdx = stops.indexOf(val)
                                        const dropoffIdx = stops.indexOf(dropoffStop)
                                        if (dropoffStop && pickupIdx >= dropoffIdx) {
                                            setDropoffStop('')
                                        }
                                    }} value={pickupStop}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stop">
                                            {pickupStop || "Select stop"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {((facility.transportConfig as any)?.stops || []).map((stop: string, idx: number) => (
                                            <SelectItem key={idx} value={stop}>{stop}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Drop-off Stop</Label>
                                    <Select onValueChange={setDropoffStop} value={dropoffStop} disabled={!pickupStop}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stop">
                                            {dropoffStop || "Select stop"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {((facility.transportConfig as any)?.stops || []).map((stop: string, idx: number) => {
                                            const stops = (facility.transportConfig as any)?.stops || []
                                            const pickupIdx = stops.indexOf(pickupStop)
                                            const isDisabled = idx <= pickupIdx
                                            
                                            return (
                                                <SelectItem key={idx} value={stop} disabled={isDisabled}>
                                                    {stop}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Seat Selection */}
                        {selectedCycle && facility.capacity && (
                            <div className="space-y-3">
                                <Label>Select Seat</Label>
                                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-4 border rounded-md bg-slate-50">
                                    {Array.from({ length: facility.capacity }).map((_, i) => {
                                        const seatNum = i + 1
                                        const isOccupied = occupiedSeats.includes(seatNum)
                                        const isSelected = selectedSeat === seatNum
                                        
                                        return (
                                        <Button
                                            key={seatNum}
                                            type="button"
                                            variant={isSelected ? "default" : isOccupied ? "secondary" : "outline"}
                                            className={cn(
                                                "h-10 w-full text-sm font-medium transition-all",
                                                isOccupied && "opacity-50 cursor-not-allowed bg-slate-200 hover:bg-slate-200",
                                                isSelected && "ring-2 ring-offset-2 ring-primary"
                                            )}
                                            disabled={isOccupied}
                                            onClick={() => setSelectedSeat(seatNum)}
                                        >
                                            {seatNum}
                                        </Button>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground justify-center">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm"></div> Selected</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 border bg-white rounded-sm"></div> Available</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div> Occupied</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Physical / Event
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input 
                                type="time" 
                                value={startTime} 
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                            </div>
                            <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input 
                                type="time" 
                                value={endTime} 
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                            </div>
                        </div>

                        {facility.type === 'EVENT' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Estimated Guest Count</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 100"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Special Requests / Amenities</Label>
                                    <Input 
                                        placeholder="e.g. Projector, Mic, Podium..."
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Recurring Booking Option (PHYSICAL & EVENT) */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="recurring"
                                    checked={isRecurring}
                                    onCheckedChange={setIsRecurring}
                                />
                                <Label htmlFor="recurring">Repeat Weekly</Label>
                            </div>
                            
                            {isRecurring && (
                                <div className="space-y-2 pl-6 border-l-2 border-slate-200">
                                    <Label>Number of Weeks</Label>
                                    <Select value={recurrenceCount} onValueChange={setRecurrenceCount}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Weeks</SelectItem>
                                            <SelectItem value="3">3 Weeks</SelectItem>
                                            <SelectItem value="4">4 Weeks (1 Month)</SelectItem>
                                            <SelectItem value="8">8 Weeks (2 Months)</SelectItem>
                                            <SelectItem value="10">10 Weeks (Semester)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        This will create separate bookings for the same time slot for the next {recurrenceCount} weeks.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={handleBook} 
                    disabled={
                        isLoading || 
                        !date || 
                        (facility.type === 'TRANSPORT' && (!selectedCycle || !selectedSeat)) ||
                        (facility.type !== 'TRANSPORT' && (!startTime || !endTime))
                    }
                >
                    {isLoading ? 'Confirming...' : 'Confirm Booking'}
                </Button>
            </CardContent>
        </Card>
      </div>


      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Join Waitlist?</DialogTitle>
                <DialogDescription>
                    {waitlistError}. Would you like to join the waitlist for this slot?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowWaitlistDialog(false)}>Cancel</Button>
                <Button onClick={handleJoinWaitlist} disabled={isLoading}>
                    {isLoading ? 'Joining...' : 'Join Waitlist'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
