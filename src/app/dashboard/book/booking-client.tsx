'use client'

import { BookingStatus } from '@prisma/client'
import type { Facility } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bus, Calendar as CalendarIcon, Clock, Dumbbell, MapPin } from 'lucide-react'
import Link from 'next/link'

interface BookingClientProps {
  facilities: Facility[]
  userId: string
  universityId: string
}

const FacilityCard = ({ facility, icon }: { facility: Facility; icon: React.ReactNode }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {facility.type}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-xl font-bold leading-tight">{facility.name}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {facility.description || 'No description available'}
      </p>
      {facility.location && (
        <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {facility.location}
        </div>
      )}
      <Link href={`/dashboard/book/${facility.id}`} className="w-full mt-4 block">
        <Button className="w-full" size="sm">
            Book Now
        </Button>
      </Link>
    </CardContent>
  </Card>
)

export default function BookingClient({ facilities, userId, universityId }: BookingClientProps) {
  // Filter facilities by type
  const physicalFacilities = facilities.filter(f => f.type === 'PHYSICAL')
  const transportFacilities = facilities.filter(f => f.type === 'TRANSPORT')

  const getIcon = (type: string) => {
    switch (type) {
      case 'PHYSICAL':
        return <Dumbbell className="h-5 w-5 text-blue-500" />
      case 'TRANSPORT':
        return <Bus className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Book a Facility</h1>
        <p className="text-muted-foreground">
          Select a facility to make a reservation
        </p>
      </div>

      <Tabs defaultValue="physical" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" /> Physical Resources
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Bus className="h-4 w-4" /> Transport
          </TabsTrigger>
        </TabsList>

        {/* Physical Facilities Tab */}
        <TabsContent value="physical">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {physicalFacilities.length === 0 ? (
               <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                 No physical resources available.
               </div>
            ) : (
              physicalFacilities.map(facility => (
                <FacilityCard 
                  key={facility.id} 
                  facility={facility} 
                  icon={getIcon(facility.type)}
                />
              ))
            )}
          </div>
        </TabsContent>


        {/* Transport Facilities Tab */}
        <TabsContent value="transport">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transportFacilities.length === 0 ? (
               <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                 No transport services available.
               </div>
            ) : (
              transportFacilities.map(facility => (
                <FacilityCard 
                  key={facility.id} 
                  facility={facility} 
                  icon={getIcon(facility.type)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
