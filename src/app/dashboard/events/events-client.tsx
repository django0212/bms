'use client'

import { useState } from 'react'
import { Event, EventRegistration, Role } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import EventCard from './event-card'

interface EventsClientProps {
  events: (Event & {
    organizer: { name: string | null; email: string }
    registrations: EventRegistration[]
    _count: { registrations: number }
  })[]
  userRole: Role
  userId: string
}

export default function EventsClient({ events, userRole, userId }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'my-events') {
      return matchesSearch && event.registrations.some(r => r.userId === userId)
    }
    
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {userRole === 'STUDENT' && (
          <Link href="/dashboard/events/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {userRole === 'STUDENT' ? (
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                {searchQuery ? 'No events found matching your search.' : 'No upcoming events found.'}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} userId={userId} userRole={userRole} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-events" className="mt-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                You haven't registered for any events yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} userId={userId} userRole={userRole} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              {searchQuery ? 'No events found matching your search.' : 'No events found.'}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} userId={userId} userRole={userRole} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
