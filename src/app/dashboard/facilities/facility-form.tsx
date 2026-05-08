'use client'

import { useState } from 'react'
import { Facility } from '@prisma/client'
import { FacilityType } from '@prisma/client'
import { addFacility, updateFacility } from '@/actions/facilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bus, Calendar, Dumbbell, Plus, Trash2, CheckSquare } from 'lucide-react'

import { useToast } from "@/hooks/use-toast"

interface FacilityFormProps {
  universityId: string
  initialData?: Facility
  isEditing?: boolean
}

const PREBUILT_AMENITIES = [
  'Projector', 'Whiteboard', 'WiFi', 'Air Conditioning', 
  'Power Outlets', 'Wheelchair Accessible', 'Microphones', 
  'Sound System', 'Ethernet Ports', 'Stage'
]

export default function FacilityForm({ universityId, initialData, isEditing = false }: FacilityFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(isEditing ? 2 : 1)
  
  const initAmenities = (initialData?.amenities as Record<string, any>) || {}

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'PHYSICAL',
    location: initialData?.location || '',
    startLocation: initialData?.startLocation || '',
    endLocation: initialData?.endLocation || '',
    operatingHours: initialData?.operatingHours || '',
    capacity: initialData?.capacity?.toString() || '',
    requiresApproval: initialData?.requiresApproval || false,
    transportConfig: (initialData?.transportConfig as any) || { stops: [], schedules: [] },
    amenities: initAmenities,
  })

  const [customAmenityName, setCustomAmenityName] = useState('')
  const [customAmenityValue, setCustomAmenityValue] = useState('')

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const newAmenities = { ...formData.amenities }
    if (checked) {
      newAmenities[amenity] = true
    } else {
      delete newAmenities[amenity]
    }
    setFormData({ ...formData, amenities: newAmenities })
  }

  const handleAmenityValueChange = (amenity: string, val: string) => {
    const newAmenities = { ...formData.amenities }
    let parsedVal: string | number | boolean = val
    if (val.toLowerCase() === 'true') parsedVal = true
    else if (val.toLowerCase() === 'false') parsedVal = false
    else if (!isNaN(Number(val)) && val.trim() !== '') parsedVal = Number(val)
    
    newAmenities[amenity] = parsedVal
    setFormData({ ...formData, amenities: newAmenities })
  }

  const handleAddCustomAmenity = () => {
    if (!customAmenityName.trim()) return
    handleAmenityValueChange(customAmenityName, customAmenityValue || 'true')
    setCustomAmenityName('')
    setCustomAmenityValue('')
  }

  const handleRemoveCustomAmenity = (amenity: string) => {
    const newAmenities = { ...formData.amenities }
    delete newAmenities[amenity]
    setFormData({ ...formData, amenities: newAmenities })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.operatingHours) {
        const hours = formData.operatingHours.split(',').map(s => s.trim())
        const isValid = hours.every(h => /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(h))
        if (!isValid) {
            toast({
                title: "Invalid Format",
                description: "Operating hours must be in HH:MM-HH:MM format (e.g., 09:00-10:00).",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }
    }

    try {
      const data = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        universityId,
      }

      if (isEditing && initialData) {
        await updateFacility(initialData.id, data)
      } else {
        await addFacility(data)
      }

      router.push('/dashboard/facilities')
      router.refresh()
      toast({
        title: "Success",
        description: isEditing ? "Facility updated successfully." : "Facility created successfully.",
      })
    } catch (error) {
      console.error('Failed to save facility:', error)
      toast({
        title: "Error",
        description: "Failed to save facility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeSelect = (type: FacilityType) => {
    setFormData({ ...formData, type })
    setStep(2)
  }

  // Parse operating hours string into array
  const parseHours = (str: string) => {
    if (!str) return []
    return str.split(',').map(range => {
      const [start, end] = range.trim().split('-')
      return { start: start?.trim() || '', end: end?.trim() || '' }
    })
  }
  const hours = parseHours(formData.operatingHours)

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {step === 1 ? (
        <div className="space-y-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Select Facility Type</h1>
            <p className="text-muted-foreground">What kind of facility would you like to add?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card 
              className="cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              onClick={() => handleTypeSelect('PHYSICAL')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4">
                  <Dumbbell className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Physical Resource</CardTitle>
                <CardDescription>
                  Study rooms, sports turf, gym equipment, etc.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
              onClick={() => handleTypeSelect('EVENT')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Event Venue</CardTitle>
                <CardDescription>
                  Auditoriums, conference halls, open air theatres, etc.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all md:col-span-2 max-w-sm mx-auto w-full"
              onClick={() => handleTypeSelect('TRANSPORT')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
                  <Bus className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Transport</CardTitle>
                <CardDescription>
                  Bus routes, buggy services, shuttle vans, etc.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="bg-zinc-50 border-b rounded-t-xl pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => !isEditing && setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {isEditing ? 'Edit Facility' : `Add ${formData.type === 'PHYSICAL' ? 'Physical Resource' : formData.type === 'EVENT' ? 'Event Venue' : 'Transport Service'}`}
              </CardTitle>
            </div>
            <CardDescription className="pl-10">
              Configure the details and parameters for this facility.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Core Details */}
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={
                      formData.type === 'TRANSPORT' ? "e.g. Route A - Main Campus" :
                      "e.g. Football Turf 1"
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the facility"
                  />
                </div>

                {formData.type !== 'TRANSPORT' && (
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="text-sm font-semibold">Location / Block</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Academic Block A"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="capacity" className="text-sm font-semibold">Capacity (Max Concurrent Bookings/Seats)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder={
                        formData.type === 'TRANSPORT' ? "e.g. 40 Seats" :
                        "e.g. 1 (Leave empty for single user)"
                    }
                  />
                </div>
                
                {/* Approval Required */}
                {(formData.type === 'PHYSICAL' || formData.type === 'EVENT') && (
                    <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50">
                      <Switch
                        id="requiresApproval"
                        checked={formData.requiresApproval}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                      />
                      <div className="grid gap-1 leading-none ml-2">
                        <Label htmlFor="requiresApproval" className="font-semibold cursor-pointer">Require Admin Approval</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          If enabled, bookings must be explicitly approved by an admin.
                        </p>
                      </div>
                    </div>
                )}
              </div>

              <hr className="border-zinc-100" />

              {/* Operating Hours - Applies to ALL facility types */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-zinc-800 flex items-center gap-2">
                     Operating Hours / Timings
                  </h3>
                </div>
                <div className="bg-zinc-50 border p-4 rounded-lg space-y-3">
                    <Label className="text-sm text-zinc-600">Define the blocks of time this facility is available</Label>
                    <div className="space-y-2">
                      {hours.map((hour, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-md bg-white shadow-sm">
                          <div className="grid gap-1 flex-1">
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <Input 
                              type="time" 
                              value={hour.start}
                              onChange={(e) => {
                                const newHours = [...hours]
                                newHours[idx].start = e.target.value
                                setFormData({
                                  ...formData,
                                  operatingHours: newHours.map(h => `${h.start}-${h.end}`).join(', ')
                                })
                              }}
                              className="h-9"
                            />
                          </div>
                          <div className="flex items-center pt-4 text-muted-foreground font-medium">to</div>
                          <div className="grid gap-1 flex-1">
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <Input 
                              type="time" 
                              value={hour.end}
                              onChange={(e) => {
                                const newHours = [...hours]
                                newHours[idx].end = e.target.value
                                setFormData({
                                  ...formData,
                                  operatingHours: newHours.map(h => `${h.start}-${h.end}`).join(', ')
                                })
                              }}
                              className="h-9"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-4 h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const newHours = [...hours]
                              newHours.splice(idx, 1)
                              setFormData({
                                ...formData,
                                operatingHours: newHours.map(h => `${h.start}-${h.end}`).join(', ')
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed py-6 mt-2"
                        onClick={() => {
                          const newHours = [...hours, { start: '', end: '' }]
                          setFormData({
                            ...formData,
                            operatingHours: newHours.map(h => `${h.start}-${h.end}`).join(', ')
                          })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Time Block
                      </Button>
                    </div>
                </div>
              </div>

              {/* Non-Transport Specific Fields: AMENITIES */}
              {formData.type !== 'TRANSPORT' && (
                <>
                  <hr className="border-zinc-100" />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-800 flex items-center gap-2">
                       Amenities & Features
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                        <Label className="text-sm font-semibold text-slate-800">Prebuilt Amenities</Label>
                        <div className="space-y-3 pt-1">
                          {PREBUILT_AMENITIES.map(amenity => {
                            const isEnabled = formData.amenities[amenity] !== undefined
                            const val = formData.amenities[amenity]
                            return (
                              <div key={amenity} className="flex items-center justify-between gap-3 bg-white p-2 px-3 border rounded-md shadow-sm">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={isEnabled} 
                                    onCheckedChange={(c) => handleAmenityToggle(amenity, c)}
                                    id={`amenity-${amenity}`}
                                  />
                                  <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">
                                    {amenity}
                                  </Label>
                                </div>
                                {isEnabled && (
                                  <Input 
                                    className="w-24 h-8 text-xs" 
                                    placeholder="Count/Value" 
                                    value={val === true ? 'Yes' : String(val)}
                                    onChange={(e) => handleAmenityValueChange(amenity, e.target.value)}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                          <Label className="text-sm font-semibold text-slate-800">Custom Amenities</Label>
                          
                          {/* List existing custom amenities */}
                          <div className="space-y-2">
                            {Object.keys(formData.amenities)
                              .filter(k => !PREBUILT_AMENITIES.includes(k))
                              .map(customKey => (
                                <div key={customKey} className="flex items-center justify-between gap-2 bg-white p-2 px-3 border rounded-md shadow-sm">
                                  <Label className="text-sm truncate w-1/2" title={customKey}>{customKey}</Label>
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input 
                                      className="h-8 text-xs flex-1" 
                                      value={String(formData.amenities[customKey])}
                                      onChange={(e) => handleAmenityValueChange(customKey, e.target.value)}
                                    />
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRemoveCustomAmenity(customKey)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>

                          {/* Add new custom amenity */}
                          <div className="flex gap-2 items-end pt-2 border-t border-slate-200 mt-4">
                            <div className="grid gap-1 flex-[2]">
                              <Label className="text-xs">Name</Label>
                              <Input 
                                placeholder="e.g. Catering" 
                                className="h-8 text-sm"
                                value={customAmenityName}
                                onChange={e => setCustomAmenityName(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-1 flex-1">
                              <Label className="text-xs">Value/Count</Label>
                              <Input 
                                placeholder="e.g. true or 1" 
                                className="h-8 text-sm"
                                value={customAmenityValue}
                                onChange={e => setCustomAmenityValue(e.target.value)}
                              />
                            </div>
                            <Button type="button" onClick={handleAddCustomAmenity} className="h-8" variant="secondary">
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Transport Specific Fields */}
              {formData.type === 'TRANSPORT' && (
                <>
                  <hr className="border-zinc-100" />
                  <div className="space-y-6">
                    <div className="p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                      <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-4">
                        <Bus className="h-5 w-5" /> Route Specifics
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startLocation" className="text-green-900">Start Location</Label>
                          <Input
                            id="startLocation"
                            value={formData.startLocation}
                            onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                            placeholder="e.g. Main Gate"
                            className="border-green-200"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endLocation" className="text-green-900">Destination</Label>
                          <Input
                            id="endLocation"
                            value={formData.endLocation}
                            onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                            placeholder="e.g. Hostel Block A"
                            className="border-green-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-green-200">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-green-900 font-semibold text-base">Route Stops</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline"
                            className="bg-white border-green-200 text-green-700 hover:bg-green-100"
                            onClick={() => {
                              const currentConfig = (formData.transportConfig as any) || { stops: [] }
                              setFormData({
                                ...formData,
                                transportConfig: {
                                  ...currentConfig,
                                  stops: [...(currentConfig.stops || []), '']
                                }
                              })
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Stop
                          </Button>
                        </div>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {((formData.transportConfig as any)?.stops || []).map((stop: any, index: number) => (
                            <div key={index} className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <Input
                                placeholder={index === 0 ? "Start Location" : "Stop Name"}
                                value={stop}
                                onChange={(e) => {
                                  const newStops = [...((formData.transportConfig as any)?.stops || [])]
                                  newStops[index] = e.target.value
                                  setFormData({
                                    ...formData,
                                    transportConfig: { ...(formData.transportConfig as any), stops: newStops }
                                  })
                                }}
                                className="h-9 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-white"
                                onClick={() => {
                                  const newStops = [...((formData.transportConfig as any)?.stops || [])]
                                  newStops.splice(index, 1)
                                  setFormData({
                                    ...formData,
                                    transportConfig: { ...(formData.transportConfig as any), stops: newStops }
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!formData.transportConfig || !(formData.transportConfig as any).stops?.length) && (
                            <p className="text-sm text-green-800 text-center py-4 bg-green-100/50 rounded-md">No stops added yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <hr className="border-zinc-100" />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" className="hover:bg-slate-100" onClick={() => router.push('/dashboard/facilities')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="px-8 shadow-md">
                  {isLoading ? 'Saving...' : (isEditing ? 'Update Facility' : 'Create Facility')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
