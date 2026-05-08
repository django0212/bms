'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
import { BlackoutDate } from '@prisma/client'
import { addBlackoutDate, removeBlackoutDate } from '@/actions/blackout-dates'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface SettingsClientProps {
  universityId: string
  initialBlackoutDates: BlackoutDate[]
}

export default function SettingsClient({ universityId, initialBlackoutDates }: SettingsClientProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!date) return
    setIsLoading(true)
    try {
      await addBlackoutDate({
        date,
        reason: reason || 'Holiday',
        universityId,
      })
      setReason('')
      toast({
        title: "Date Added",
        description: "Blackout date has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add blackout date.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeBlackoutDate(id)
      toast({
        title: "Date Removed",
        description: "Blackout date has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove blackout date.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage university-wide settings.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add New Date */}
        <Card>
            <CardHeader>
                <CardTitle>Add Blackout Date</CardTitle>
                <CardDescription>Block bookings for holidays or maintenance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center border rounded-md p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input 
                        placeholder="e.g. National Holiday" 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <Button 
                    className="w-full" 
                    onClick={handleAdd}
                    disabled={!date || isLoading}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Blackout Date
                </Button>
            </CardContent>
        </Card>

        {/* List Existing Dates */}
        <Card>
            <CardHeader>
                <CardTitle>Existing Blackout Dates</CardTitle>
                <CardDescription>Currently blocked dates.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {initialBlackoutDates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No blackout dates set.</p>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {initialBlackoutDates.map((bd) => (
                                <div key={bd.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                    <div>
                                        <p className="font-medium">{format(new Date(bd.date), 'MMMM d, yyyy')}</p>
                                        <p className="text-xs text-muted-foreground">{bd.reason}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemove(bd.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
