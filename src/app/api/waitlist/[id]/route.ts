import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
    })

    if (!waitlistEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (waitlistEntry.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.waitlist.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to leave waitlist' },
      { status: 500 }
    )
  }
}
