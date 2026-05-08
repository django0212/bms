'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Activity, TrendingUp, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface AnalyticsDashboardProps {
  data: {
    totalBookings: number
    growth: number
    activeStudentsCount: number
    pendingBookingsCount: number
    popularData: { name: string; bookings: number }[]
    peakHoursData: { hour: string; bookings: number }[]
    recentBookings: any[]
  }
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings (Month)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {data.growth > 0 ? '+' : ''}{data.growth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeStudentsCount}</div>
            <p className="text-xs text-muted-foreground">Unique users this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingBookingsCount}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Popular Facilities Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Most Popular Facilities</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.popularData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings List */}
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest activity across campus.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.recentBookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent bookings.</p>
                    ) : (
                        data.recentBookings.map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{booking.facility.name}</p>
                                    <p className="text-xs text-muted-foreground">{booking.user.name || booking.user.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {booking.status}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Peak Hours Chart */}
      <Card>
          <CardHeader>
            <CardTitle>Peak Usage Hours</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                        dataKey="hour" 
                        tick={{fontSize: 12}} 
                        interval={3}
                    />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
