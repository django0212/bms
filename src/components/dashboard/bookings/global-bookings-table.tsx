'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface GlobalBookingsTableProps {
  bookings: any[]
}

export function GlobalBookingsTable({ bookings }: GlobalBookingsTableProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
      case 'CANCELLED': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            defaultValue={searchParams.get('query')?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select 
            defaultValue={searchParams.get('status') || 'ALL'} 
            onValueChange={(val) => handleFilter('status', val)}
        >
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
        </Select>
        <Select 
            defaultValue={searchParams.get('type') || 'ALL'} 
            onValueChange={(val) => handleFilter('type', val)}
        >
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Facility Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PHYSICAL">Physical</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.user.name}</div>
                    <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.facility.name}</div>
                    <div className="text-xs text-muted-foreground">{booking.facility.type}</div>
                  </TableCell>
                  <TableCell>{booking.university.name}</TableCell>
                  <TableCell>{format(new Date(booking.startTime), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
