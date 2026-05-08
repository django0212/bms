import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const waitlistSchema = z.object({
  facilityId: z.string(),
  universityId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { facilityId, universityId, startTime, endTime } = waitlistSchema.parse(body)

    // Check if user is already on waitlist for this slot
    const existingEntry = await prisma.waitlist.findFirst({
      where: {
        userId: user.id,
        facilityId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this slot' },
        { status: 400 }
      )
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        userId: user.id,
        facilityId,
        universityId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    })

    return NextResponse.json(waitlistEntry)
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const waitlist = await prisma.waitlist.findMany({
      where: {
        userId: user.id,
      },
      include: {
        facility: true,
        university: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(waitlist)
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
