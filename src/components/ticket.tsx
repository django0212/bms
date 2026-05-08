import { format } from 'date-fns'
import { ArrowRight, QrCode } from 'lucide-react'

interface TicketProps {
  booking: {
    id: string
    startTime: Date
    endTime: Date
    seatNumber: number | null
    pickupStop?: string | null
    dropoffStop?: string | null
    guestCount?: number | null
    specialRequests?: string | null
    facility: {
      name: string
      type: string
      startLocation?: string | null
      endLocation?: string | null
    }
    user: {
      name: string | null
      email: string
      studentId: string | null
    }
  }
  universityName: string
  universityLogo?: string | null
  primaryColor?: string | null
}

export function Ticket({ booking, universityName, universityLogo, primaryColor }: TicketProps) {
  const isTransport = booking.facility.type === 'TRANSPORT'
  // Create a gradient based on the primary color
  const bgColor = primaryColor || '#0f172a' // Default to slate-900
  
  return (
    <div className="w-full max-w-[360px] mx-auto filter drop-shadow-2xl perspective-1000 group">
      {/* Pass Container */}
      <div 
        className="rounded-[24px] overflow-hidden text-white relative flex flex-col transition-transform duration-500 ease-out transform group-hover:scale-[1.02]"
        style={{ 
            background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, -20)} 100%)`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
        }}
      >
        {/* Decorative Watermark */}
        <div className="absolute -right-10 -top-10 w-48 h-48 opacity-[0.07] pointer-events-none rotate-12">
            {universityLogo ? (
                <img src={universityLogo} alt="" className="w-full h-full object-contain grayscale" />
            ) : (
                <div className="w-full h-full rounded-full border-[20px] border-white" />
            )}
        </div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* Header Section */}
        <div className="p-6 pb-4 flex justify-between items-start gap-4 relative z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {universityLogo ? (
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 flex-shrink-0 shadow-lg">
                        <img src={universityLogo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md flex-shrink-0 shadow-inner border border-white/10">
                        <span className="font-bold text-sm">{universityName.substring(0, 2).toUpperCase()}</span>
                    </div>
                )}
                <span className="font-bold text-sm tracking-wide uppercase opacity-95 leading-tight text-shadow-sm">
                    {universityName}
                </span>
            </div>
            <div className="text-right flex-shrink-0">
                <span className="block text-[9px] uppercase opacity-60 font-bold tracking-[0.2em] mb-1">Booking ID</span>
                <span className="font-mono font-bold text-sm tracking-wider bg-black/20 px-2 py-1 rounded text-white/90 border border-white/5">
                    {booking.id.substring(0, 8).toUpperCase()}
                </span>
            </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-2 relative z-10">
            {isTransport ? (
                <div className="flex justify-between items-center my-6">
                    <div className="text-left">
                        <span className="block text-[9px] uppercase opacity-60 font-bold tracking-[0.2em] mb-1">From</span>
                        <span className="font-black text-4xl leading-none tracking-tight">
                            {(booking.pickupStop || booking.facility.startLocation || '???').substring(0, 3).toUpperCase()}
                        </span>
                        <span className="block text-xs font-medium opacity-80 mt-1 truncate max-w-[100px]">
                            {booking.pickupStop || booking.facility.startLocation}
                        </span>
                    </div>
                    <div className="flex-1 flex justify-center items-center px-4 opacity-40">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent relative">
                            <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[9px] uppercase opacity-60 font-bold tracking-[0.2em] mb-1">To</span>
                        <span className="font-black text-4xl leading-none tracking-tight">
                            {(booking.dropoffStop || booking.facility.endLocation || '???').substring(0, 3).toUpperCase()}
                        </span>
                        <span className="block text-xs font-medium opacity-80 mt-1 truncate max-w-[100px] ml-auto">
                            {booking.dropoffStop || booking.facility.endLocation}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="my-8">
                    <span className="block text-[9px] uppercase opacity-60 font-bold tracking-[0.2em] mb-2">Facility Access</span>
                    <h2 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                        {booking.facility.name}
                    </h2>
                    <span className="inline-flex items-center mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/10 border border-white/10 backdrop-blur-sm tracking-wider">
                        {booking.facility.type}
                    </span>
                </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-4 gap-y-5 gap-x-4 mt-8 mb-6 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="col-span-2">
                    <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Student</span>
                    <span className="font-semibold text-sm truncate block">{booking.user.name || booking.user.email}</span>
                </div>
                <div className="col-span-2 text-right">
                     {booking.user.studentId && (
                        <>
                            <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">ID Number</span>
                            <span className="font-mono font-bold text-sm tracking-wider bg-black/20 px-2 py-1 rounded text-white/90 border border-white/5 inline-block">
                                {booking.user.studentId}
                            </span>
                        </>
                     )}
                </div>

                <div>
                    <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Date</span>
                    <span className="font-semibold text-sm">{format(new Date(booking.startTime), 'MMM d')}</span>
                </div>
                <div className="col-span-2 text-center">
                    <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Time</span>
                    <span className="font-semibold text-sm">
                        {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                    </span>
                </div>
                <div className="text-right">
                    {booking.seatNumber ? (
                        <>
                            <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Seat</span>
                            <span className="font-black text-xl leading-none text-white">{booking.seatNumber}</span>
                        </>
                    ) : booking.guestCount ? (
                        <>
                            <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Guests</span>
                            <span className="font-black text-xl leading-none text-white">{booking.guestCount}</span>
                        </>
                    ) : (
                        <>
                            <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1 text-right">Entry</span>
                            <span className="font-semibold text-sm inline-block text-right">
                                Standard
                            </span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Special Requests */}
            {booking.specialRequests && (
                <div className="mt-4 mb-4 pt-3 border-t border-white/10">
                    <span className="block text-[9px] uppercase opacity-50 font-bold tracking-[0.2em] mb-1">Special Requests</span>
                    <p className="text-xs italic opacity-80 font-medium">{booking.specialRequests}</p>
                </div>
            )}
        </div>

        {/* Tear-off Section */}
        <div className="relative">
            {/* Perforation Line */}
            <div className="absolute top-0 left-0 right-0 h-4 -mt-2 z-20 flex justify-between items-center px-1">
                {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-slate-50 opacity-100" />
                ))}
            </div>

            <div className="bg-white text-slate-900 p-6 pt-8 relative">
                {/* Notches for perforation effect */}
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-slate-50"></div>
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-slate-50"></div>

                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {/* Holographic Badge Effect */}
                            <div className="relative overflow-hidden rounded px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-50 border border-green-200">
                                <span className="relative z-10 text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Verified
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-[160px] leading-relaxed font-medium">
                            Scan this code at the facility entrance. This ticket is valid only for the specified time.
                        </p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}&bgcolor=ffffff`} 
                            alt="QR Code" 
                            className="w-20 h-20 mix-blend-multiply"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

// Helper to darken/lighten hex color
function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
