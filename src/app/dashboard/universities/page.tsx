import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function UniversitiesPage() {
  await requireSuperAdmin()

  const universities = await prisma.university.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { users: true, facilities: true },
      },
    },
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Universities</h1>
        <Link href="/dashboard/universities/new">
          <Button>Add University</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.map((uni) => (
                <TableRow key={uni.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {uni.logoUrl && (
                        <img
                          src={uni.logoUrl}
                          alt={uni.name}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      {uni.name}
                    </div>
                  </TableCell>
                  <TableCell>{uni.domain}</TableCell>
                  <TableCell>{uni._count.users}</TableCell>
                  <TableCell>{uni._count.facilities}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/universities/${uni.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {universities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No universities found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
