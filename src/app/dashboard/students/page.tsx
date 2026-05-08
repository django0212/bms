import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getStudents } from '@/actions/users'
import { StudentTable } from '@/components/dashboard/students/student-table'
import { BulkAddModal } from '@/components/dashboard/students/bulk-add-modal'
import { AddStudentModal } from '@/components/dashboard/students/add-student-modal'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; batch?: string; status?: string; role?: string }>
}) {
  const user = await getCurrentUser()

  if (!user || !user.universityId) {
    redirect('/login')
  }

  const query = (await searchParams).query
  const batch = (await searchParams).batch
  const status = (await searchParams).status as 'active' | 'inactive' | 'all' | undefined
  const role = (await searchParams).role as any

  const students = await getStudents(user.universityId, query, status, batch, role)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Students</h1>
          <p className="text-zinc-500">Manage students for your university.</p>
        </div>
        <div className="flex gap-2">
          <AddStudentModal universityId={user.universityId} />
          <BulkAddModal universityId={user.universityId} />
        </div>
      </div>

      <StudentTable students={students} />
    </div>
  )
}
