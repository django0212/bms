'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { getMasterSchedule } from '@/actions/schedule'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FacilityType } from '@prisma/client'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface ScheduleClientProps {
  universityId: string
}

export default function ScheduleClient({ universityId }: ScheduleClientProps) {
  const [events, setEvents] = useState<any[]>([])
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [filterType, setFilterType] = useState<string>('ALL')

  const fetchEvents = async () => {
    // Fetch a broad range around the current date to ensure smooth navigation
    // In a real app, you'd fetch based on the visible range (onRangeChange)
    // For simplicity, we'll fetch +/- 1 month from current date
    const start = new Date(date)
    start.setMonth(start.getMonth() - 1)
    const end = new Date(date)
    end.setMonth(end.getMonth() + 1)

    const data = await getMasterSchedule(universityId, start, end)
    
    // Client-side filtering
    const filtered = filterType === 'ALL' 
        ? data 
        : data.filter(evt => evt.resource.type === filterType)
        
    setEvents(filtered)
  }

  useEffect(() => {
    fetchEvents()
  }, [date, filterType])

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad'
    switch (event.resource.type) {
      case 'PHYSICAL':
        backgroundColor = '#3b82f6' // blue-500
        break
      case 'EVENT':
        backgroundColor = '#a855f7' // purple-500
        break
      case 'TRANSPORT':
        backgroundColor = '#22c55e' // green-500
        break
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Schedule</h1>
            <p className="text-muted-foreground">Overview of all confirmed bookings.</p>
        </div>
        <div className="w-[200px]">
            <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Facilities</SelectItem>
                    <SelectItem value="PHYSICAL">Physical Spaces</SelectItem>
                    <SelectItem value="EVENT">Event Venues</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
            <div className="h-[600px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    popup
                />
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
