'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, ClipboardList } from 'lucide-react'

interface SuperAdminDashboardProps {
  data: {
    universityCount: number
    adminCount: number
    studentCount: number
    bookingCount: number
    recentBookings: any[]
  }
}

export default function SuperAdminDashboard({ data }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.universityCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.studentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bookingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {data.recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium">{booking.user.name} booked {booking.facility.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.university.name} • {new Date(booking.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
