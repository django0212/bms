import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface FacilityCardProps {
  facility: {
    id: string
    name: string
    description: string | null
    location: string | null
    amenities: string[]
  }
}

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-1">{facility.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {facility.location || 'Location TBD'}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-zinc-600 line-clamp-2">{facility.description}</p>
        
        {facility.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {facility.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-zinc-100 px-2 py-1 rounded-full text-zinc-700">
                <CheckCircle2 className="h-3 w-3" />
                {amenity}
              </span>
            ))}
            {facility.amenities.length > 3 && (
              <span className="text-xs text-zinc-500 self-center">+{facility.amenities.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/dashboard/book/${facility.id}`} className="w-full">
            <Button variant="outline" className="w-full">
            Book Slot
            </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
