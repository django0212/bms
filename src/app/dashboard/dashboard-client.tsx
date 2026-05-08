'use client'

import { useState, useEffect } from 'react'

import { useUniversity } from '@/contexts/university-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserWithRole } from '@/lib/auth'
import { 
  Building2, 
  Users, 
  School, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TicketIcon } from 'lucide-react'

import { TicketModal } from '@/components/ticket-modal'
import { WaitlistCard } from '@/components/waitlist-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from '@/components/dashboard/event-card'
import { FacilityCard } from '@/components/dashboard/facility-card'

interface DashboardClientProps {
  user: UserWithRole
  stats: any // Using any here for simplicity as the shape varies by role
}

export default function DashboardClient({ user, stats }: DashboardClientProps) {
  const university = useUniversity()
  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isAdmin = user.role === 'ADMIN'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const StatCard = ({ title, value, description, icon: Icon, colorClass }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-0">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
              Welcome back, {user.name || 'User'}!
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300 text-base">
              {isSuperAdmin 
                ? "Here's what's happening across the platform."
                : `Here's an overview of your activity at ${university.name}.`
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Super Admin Stats */}
        {isSuperAdmin && stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Universities" 
              value={stats.universityCount} 
              description="Total registered universities" 
              icon={School} 
              colorClass="text-blue-600"
            />
            <StatCard 
              title="Admins" 
              value={stats.adminCount} 
              description="Total system administrators" 
              icon={Users} 
              colorClass="text-indigo-600"
            />
          </div>
        )}

        {/* Admin Stats */}
        {isAdmin && stats && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Facilities" 
                value={stats.facilitiesCount} 
                description="Active campus resources" 
                icon={Building2} 
                colorClass="text-blue-600"
              />
              <StatCard 
                title="Total Students" 
                value={stats.studentsCount} 
                description="Registered student accounts" 
                icon={Users} 
                colorClass="text-green-600"
              />
              <StatCard 
                title="Pending Requests" 
                value={stats.pendingBookingsCount} 
                description="Awaiting approval" 
                icon={AlertCircle} 
                colorClass="text-amber-600"
              />
              <StatCard 
                title="Active Bookings" 
                value={stats.activeBookingsCount} 
                description="Currently ongoing or upcoming" 
                icon={CheckCircle2} 
                colorClass="text-purple-600"
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
              {stats.recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  No recent bookings found.
                </div>
              ) : (
                <div className="grid gap-4">
                  {stats.recentBookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                            booking.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.facility.name}</p>
                            <p className="text-sm text-muted-foreground">
                              by {booking.user.name || booking.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(booking.startTime), 'MMM d, h:mm a')}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Student Stats */}
        {!isSuperAdmin && !isAdmin && stats && (
          mounted ? (
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-zinc-100/50 border border-zinc-200 p-1 h-auto">
                    <TabsTrigger value="overview" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="waitlist" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm">
                        Waitlist
                        {stats.waitlist && stats.waitlist.length > 0 && (
                            <span className="ml-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                {stats.waitlist.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Upcoming Bookings" 
                    value={stats.upcomingBookings.length} 
                    description="Confirmed reservations" 
                    icon={Calendar} 
                    colorClass="text-blue-600"
                />
                <StatCard 
                    title="Pending Requests" 
                    value={stats.pendingRequests} 
                    description="Awaiting admin approval" 
                    icon={Clock} 
                    colorClass="text-amber-600"
                />
                </div>

                <div className="grid gap-8 md:grid-cols-3 mt-10">
                    {/* Quick Actions */}
                    <Card className="col-span-1 h-fit border-zinc-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold tracking-tight text-zinc-900">Quick Actions</CardTitle>
                            <CardDescription className="text-zinc-500">Frequently used shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/dashboard/book" className="block">
                                <Button className="w-full justify-start gap-3 h-11 font-medium" variant="default">
                                    <Plus className="h-4 w-4" />
                                    New Booking
                                </Button>
                            </Link>
                            <Link href="/dashboard/my-bookings" className="block">
                                <Button className="w-full justify-start gap-3 h-11 text-zinc-600 hover:text-zinc-900" variant="outline">
                                    <TicketIcon className="h-4 w-4" />
                                    My Tickets
                                </Button>
                            </Link>
                            <Link href="/dashboard/profile" className="block">
                                <Button className="w-full justify-start gap-3 h-11 text-zinc-600 hover:text-zinc-900" variant="outline">
                                    <Users className="h-4 w-4" />
                                    Profile Settings
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Upcoming Bookings */}
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Upcoming Bookings</h2>
                            <Link href="/dashboard/my-bookings" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                View all
                            </Link>
                        </div>
                        
                        {stats.upcomingBookings.length === 0 ? (
                            <Card className="bg-zinc-50/50 border-dashed border-zinc-200 shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                        <Calendar className="h-6 w-6 text-zinc-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-zinc-900">No upcoming bookings</h3>
                                    <p className="text-sm text-zinc-500 mb-6 max-w-xs mt-1">
                                        You don't have any confirmed bookings coming up.
                                    </p>
                                    <Link href="/dashboard/book">
                                        <Button variant="outline">Schedule Now</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {stats.upcomingBookings.slice(0, 3).map((booking: any) => (
                                    <Card key={booking.id} className="group hover:border-zinc-300 transition-all duration-200 shadow-sm border-zinc-200">
                                        <CardContent className="p-5 flex items-center gap-5">
                                            {/* Icon Box */}
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                booking.facility.type === 'PHYSICAL' ? 'bg-blue-50 text-blue-600' :
                                                booking.facility.type === 'EVENT' ? 'bg-purple-50 text-purple-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {booking.facility.type === 'TRANSPORT' ? <Building2 className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-zinc-900 truncate">{booking.facility.name}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                                                        booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>
                                                            {format(new Date(booking.startTime), 'MMM d, h:mm a')}
                                                        </span>
                                                    </div>
                                                    <span className="text-zinc-300">•</span>
                                                    <span>{format(new Date(booking.endTime), 'h:mm a')}</span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="flex-shrink-0">
                                                <TicketModal booking={booking} universityName={university.name} universityLogo={university.logoUrl} primaryColor={university.primaryColor} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Events Section Removed as per user request */}

                {/* Facilities Section */}
                {stats.facilities && stats.facilities.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Campus Facilities</h2>
                            <Link href="/dashboard/book?type=PHYSICAL" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {stats.facilities.map((facility: any) => (
                                <FacilityCard key={facility.id} facility={facility} />
                            ))}
                        </div>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="waitlist" className="mt-0">
                {stats.waitlist && stats.waitlist.length > 0 ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900">My Waitlist</h2>
                            <p className="text-zinc-500">Manage your waitlisted slots.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {stats.waitlist.map((entry: any) => (
                                <WaitlistCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="bg-zinc-50/50 border-dashed border-zinc-200 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-zinc-400" />
                            </div>
                            <h3 className="text-base font-semibold text-zinc-900">No waitlisted items</h3>
                            <p className="text-sm text-zinc-500 mb-6 max-w-xs mt-1">
                                You are not currently on any waitlists.
                            </p>
                            <Link href="/dashboard/book">
                                <Button variant="outline">Browse Facilities</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
          </Tabs>
          ) : null
        )}
      </div>
    </div>
  )
}
