import { format } from 'date-fns'
import { Calendar, MapPin, Clock, QrCode, CheckCircle2, Ticket as TicketIcon } from 'lucide-react'

interface TicketViewProps {
  booking: {
    id: string
    startTime: Date
    endTime: Date
    ticketCode?: string | null
    seatNumber?: number | null
    guestCount?: number | null
    facility: {
      name: string
      type: string
      location?: string | null
      startLocation?: string | null
      endLocation?: string | null
      amenities?: string[]
      eventDate?: Date | null
    }
    user: {
      name: string | null
      email: string
      studentId?: string | null
    }
  }
  universityName: string
  universityLogo?: string | null
  primaryColor?: string | null
}

export function TicketView({ booking, universityName, universityLogo, primaryColor }: TicketViewProps) {
  const isEvent = booking.facility.type === 'EVENT'
  const bgColor = primaryColor || '#0f172a'

  if (isEvent) {
    return (
      <div className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Event Header Image / Pattern */}
        <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-700 relative p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                    EVENT TICKET
                </div>
                {universityLogo && (
                    <img src={universityLogo} alt="Logo" className="w-8 h-8 object-contain bg-white rounded-full p-1" />
                )}
            </div>
            <h2 className="text-white font-bold text-xl leading-tight line-clamp-2">
                {booking.facility.name}
            </h2>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Date</p>
                    <p className="font-semibold text-zinc-900">{format(new Date(booking.startTime), 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Time</p>
                    <p className="font-semibold text-zinc-900">{format(new Date(booking.startTime), 'h:mm a')}</p>
                </div>
            </div>

            <div>
                <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Location</p>
                <div className="flex items-center gap-2 text-zinc-700">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium">{booking.facility.location || 'TBD'}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-zinc-200 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Admit</p>
                        <p className="font-bold text-lg text-zinc-900">1 Person</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Ticket Code</p>
                         <p className="font-mono font-bold text-lg text-zinc-900 tracking-widest">
                            {booking.ticketCode || booking.id.substring(0, 6).toUpperCase()}
                         </p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center pt-2">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.ticketCode || booking.id}&bgcolor=ffffff`} 
                    alt="QR Code" 
                    className="w-32 h-32 mix-blend-multiply opacity-90"
                />
            </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="h-3 bg-gradient-to-r from-purple-600 to-indigo-700"></div>
      </div>
    )
  }

  // Facility / Transport Ticket
  return (
    <div className="w-full max-w-[340px] bg-white rounded-xl overflow-hidden shadow-xl border border-zinc-200">
        <div className="p-6 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    booking.facility.type === 'TRANSPORT' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                    {booking.facility.type === 'TRANSPORT' ? <TicketIcon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="font-bold text-zinc-900 text-lg leading-tight">{booking.facility.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{booking.facility.type} RESERVATION</p>
                </div>
            </div>

            <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-zinc-900">
                            {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-xs text-zinc-500">Date</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-zinc-900">
                            {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                        </p>
                        <p className="text-xs text-zinc-500">Time Slot</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-zinc-900">
                            {booking.facility.location || booking.facility.startLocation || 'Campus'}
                        </p>
                        <p className="text-xs text-zinc-500">Location</p>
                    </div>
                </div>
            </div>
        </div>

        {booking.facility.amenities && booking.facility.amenities.length > 0 && (
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Included Amenities</p>
                <div className="flex flex-wrap gap-2">
                    {booking.facility.amenities.map((amenity, i) => (
                        <span key={i} className="text-[10px] bg-white border border-zinc-200 px-2 py-1 rounded-md text-zinc-600 font-medium shadow-sm">
                            {amenity}
                        </span>
                    ))}
                </div>
            </div>
        )}

        <div className="p-4 bg-zinc-50 flex justify-between items-center">
            <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Booking ID</p>
                <p className="font-mono text-xs font-medium text-zinc-600">{booking.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
                 <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Status</p>
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                    CONFIRMED
                 </span>
            </div>
        </div>
    </div>
  )
}
