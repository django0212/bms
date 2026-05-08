'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CalendarIcon, Check, ChevronsUpDown, MapPin, Users } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface Facility {
  id: string
  name: string
  capacity: number | null
  location: string | null
}

interface EventFormProps {
  universityId: string
  facilities: Facility[]
}

export default function EventForm({ universityId, facilities }: EventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Batches
  const availableBatches = ['2023', '2024', '2025', '2026']
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    facilityId: '',
    location: '',
    capacity: '',
    allowedBatches: [] as string[],
  })

  const handleFacilityChange = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId)
    if (facility) {
      setFormData(prev => ({
        ...prev,
        facilityId,
        location: facility.location || facility.name,
        // Reset capacity if it exceeds new facility's capacity
        capacity: (prev.capacity && facility.capacity && parseInt(prev.capacity) > facility.capacity) 
          ? facility.capacity.toString() 
          : prev.capacity
      }))
    }
  }

  const toggleBatch = (batch: string) => {
    setFormData(prev => {
      const current = prev.allowedBatches
      const updated = current.includes(batch)
        ? current.filter(b => b !== batch)
        : [...current, batch]
      return { ...prev, allowedBatches: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        throw new Error('End time must be after start time')
      }

      const facility = facilities.find(f => f.id === formData.facilityId)
      if (!facility) {
        throw new Error('Please select a facility')
      }

      const eventCapacity = formData.capacity ? parseInt(formData.capacity) : 0
      if (facility.capacity && eventCapacity > facility.capacity) {
        throw new Error(`Event capacity cannot exceed facility capacity (${facility.capacity})`)
      }

      await createEvent({
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        location: formData.location,
        facilityId: formData.facilityId,
        allowedBatches: formData.allowedBatches,
        capacity: eventCapacity || undefined,
      })

      toast({
        title: "Event Created",
        description: "Your event has been successfully published.",
      })
      
      router.push('/dashboard/events')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="e.g. Annual Tech Symposium"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this event is about..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start"
                  type="datetime-local"
                  className="pl-9"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end"
                  type="datetime-local"
                  className="pl-9"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility">Facility (Required)</Label>
              <Select 
                value={formData.facilityId} 
                onValueChange={handleFacilityChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(facility => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name} (Cap: {facility.capacity || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Event Capacity</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Max attendees"
                  className="pl-9"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  max={facilities.find(f => f.id === formData.facilityId)?.capacity || undefined}
                />
              </div>
              {formData.facilityId && (
                <p className="text-xs text-muted-foreground">
                  Max capacity: {facilities.find(f => f.id === formData.facilityId)?.capacity || 'Unlimited'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
             <Label>Location (Auto-filled)</Label>
             <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.location}
                  readOnly
                  className="pl-9 bg-muted"
                  placeholder="Select a facility to set location"
                />
             </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Label>Target Audience (Batches)</Label>
            <p className="text-xs text-muted-foreground">
              Select specific batches. Leave empty to open to all.
            </p>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {formData.allowedBatches.length > 0 
                    ? `${formData.allowedBatches.length} batch(es) selected` 
                    : "Select batches (Optional)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="p-2 space-y-2">
                  {availableBatches.map(batch => (
                    <div key={batch} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`batch-${batch}`}
                        checked={formData.allowedBatches.includes(batch)}
                        onCheckedChange={() => toggleBatch(batch)}
                      />
                      <label 
                        htmlFor={`batch-${batch}`} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Batch {batch}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 flex-wrap">
                {formData.allowedBatches.map(batch => (
                    <span key={batch} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {batch}
                    </span>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
