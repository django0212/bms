'use client'

import { useState } from 'react'
import { addUniversityAdmin, removeUniversityAdmin, deleteUniversity } from '@/actions/super-admin'
import { EditUniversityModal } from '@/components/dashboard/universities/edit-university-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type User = {
  id: string
  name: string | null
  email: string
  role: string
}

type University = {
  id: string
  name: string
  slug: string
  domain: string | null
  allowedDomains: string[]
  logoUrl: string | null
  primaryColor: string | null
}

export default function UniversityClient({ 
  university, 
  admins, 
  students 
}: { 
  university: University
  admins: User[]
  students: User[]
}) {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleDeleteUniversity = async () => {
    if (confirm('Are you sure you want to delete this university? This action cannot be undone.')) {
      await deleteUniversity(university.id)
      router.push('/dashboard/universities')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {university.logoUrl && (
              <img
                src={university.logoUrl}
                alt={university.name}
                className="w-16 h-16 object-contain border rounded-lg p-1 bg-white"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{university.name}</h1>
              <div className="flex gap-2 text-muted-foreground mt-1">
                <span>{university.domain}</span>
                {university.allowedDomains.length > 0 && (
                  <span>• Allowed: {university.allowedDomains.join(', ')}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <EditUniversityModal university={university} />
            <Button variant="destructive" onClick={handleDeleteUniversity}>
              Delete University
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search users..."
            onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString())
                if (e.target.value) {
                    params.set('query', e.target.value)
                } else {
                    params.delete('query')
                }
                router.replace(`${pathname}?${params.toString()}`)
            }}
            defaultValue={searchParams.get('query') || ''}
          />
        </div>
      </div>

      <div className="grid gap-8">
        {/* Admins Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>University Admins</CardTitle>
              <CardDescription>Manage administrators for this university</CardDescription>
            </div>
            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
              <DialogTrigger asChild>
                <Button>Add Admin</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <form 
                  action={async (formData) => {
                    await addUniversityAdmin(null, formData)
                    setIsAddAdminOpen(false)
                  }} 
                  className="space-y-4 mt-4"
                >
                  <input type="hidden" name="universityId" value={university.id} />
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">Create Admin</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name || 'N/A'}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <form action={async () => { await removeUniversityAdmin(admin.id, university.id) }}>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Remove
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No admins found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name || 'N/A'}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                       {/* Date formatting would be better here */}
                       Active
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
