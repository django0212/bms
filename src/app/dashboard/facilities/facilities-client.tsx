'use client'

import { useState } from 'react'
import type { Facility } from '@prisma/client'
import { FacilityType } from '@prisma/client'
import { removeFacility } from '@/actions/facilities'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Trash2, MapPin, Users, Clock, CheckCircle2, Bus, Calendar, Dumbbell, ArrowRight, Search, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

interface FacilitiesClientProps {
  facilities: Facility[]
  universityId: string
}

export default function FacilitiesClient({ facilities, universityId }: FacilitiesClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRemove = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await removeFacility(deleteId)
      router.refresh()
      toast({
        title: "Success",
        description: "Facility removed successfully.",
      })
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to remove facility:', error)
      toast({
        title: "Error",
        description: "Failed to remove facility.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getIcon = (type: FacilityType) => {
    switch (type) {
      case 'PHYSICAL':
        return <Dumbbell className="h-5 w-5 text-blue-500" />
      case 'EVENT':
        return <Calendar className="h-5 w-5 text-purple-500" />
      case 'TRANSPORT':
        return <Bus className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedFacilities = {
    PHYSICAL: filteredFacilities.filter(f => f.type === 'PHYSICAL'),
    EVENT: filteredFacilities.filter(f => f.type === 'EVENT'),
    TRANSPORT: filteredFacilities.filter(f => f.type === 'TRANSPORT'),
  }

  const renderFacilityGroup = (title: string, icon: React.ReactNode, groupFacilities: Facility[]) => {
    if (groupFacilities.length === 0) return null
    return (
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 pb-2 border-b">
            {icon}
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            <span className="text-sm text-muted-foreground ml-2">({groupFacilities.length})</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupFacilities.map((facility) => (
                <Card key={facility.id} className="group hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {getIcon(facility.type)}
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/facilities/${facility.id}/edit`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        </Link>
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(facility.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </div>
                    <CardDescription>{facility.type === 'PHYSICAL' ? 'Physical Resource' : facility.type === 'EVENT' ? 'Event Venue' : 'Transport Service'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                    {facility.description && (
                        <p className="text-muted-foreground line-clamp-2">{facility.description}</p>
                    )}
                    
                    {facility.operatingHours && (
                        <div className="flex items-center gap-2 text-muted-foreground pt-2 mt-2 border-t">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{facility.operatingHours}</span>
                        </div>
                    )}
                    
                    {/* Transport Specific Info */}
                    {facility.type === 'TRANSPORT' && (
                        <div className="pt-2 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{facility.startLocation} <ArrowRight className="inline h-3 w-3 mx-1" /> {facility.endLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{facility.capacity} Seats</span>
                        </div>
                        </div>
                    )}

                    {/* Event Specific Info */}
                    {facility.type === 'EVENT' && facility.requiresApproval && (
                        <div className="pt-2 mt-2 border-t">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-full text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Requires Approval</span>
                        </div>
                        </div>
                    )}
                    </div>
                </CardContent>
                </Card>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Facilities</h1>
          <p className="text-muted-foreground">
            Add, remove, and modify facilities for your university
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search facilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>
            <Link href="/dashboard/facilities/new">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Facility
            </Button>
            </Link>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            {searchQuery ? 'No facilities found matching your search.' : 'No facilities found. Add one to get started.'}
        </div>
      ) : (
        <div className="space-y-8">
            {renderFacilityGroup('Physical Resources', <Dumbbell className="h-5 w-5 text-blue-500" />, groupedFacilities.PHYSICAL)}
            {renderFacilityGroup('Event Venues', <Calendar className="h-5 w-5 text-purple-500" />, groupedFacilities.EVENT)}
            {renderFacilityGroup('Transport Services', <Bus className="h-5 w-5 text-green-500" />, groupedFacilities.TRANSPORT)}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Facility"
        description="Are you sure you want to delete this facility? This action cannot be undone and will remove all associated bookings."
        onConfirm={handleRemove}
        isLoading={isDeleting}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
