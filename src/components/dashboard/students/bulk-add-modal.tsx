'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { read, utils } from 'xlsx'
import { bulkCreateStudents } from '@/actions/users'
import { toast } from 'sonner'

interface BulkAddModalProps {
  universityId: string
}

export function BulkAddModal({ universityId }: BulkAddModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const data = await selectedFile.arrayBuffer()
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json(worksheet)
    setPreview(jsonData)
  }

  const handleSubmit = async () => {
    if (!preview.length) return

    setIsLoading(true)
    try {
      // Validate and map data
      const students = preview.map((row: any) => ({
        name: row.Name || row.name,
        email: row.Email || row.email,
        studentId: row.StudentId || row.studentId || row['Student ID'],
        batch: row.Batch || row.batch ? String(row.Batch || row.batch) : undefined,
      })).filter(s => s.name && s.email && s.studentId)

      if (students.length === 0) {
        toast.error('No valid students found in file')
        return
      }

      const result = await bulkCreateStudents(students, universityId)
      
      if (result.success) {
        toast.success(`Successfully added ${students.length} students`)
        setOpen(false)
        setFile(null)
        setPreview([])
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to process file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Add Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Students</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with columns: Name, Email, Student ID, Batch (Optional).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Student List (Excel/CSV)</Label>
            <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
          </div>
          
          {preview.length > 0 && (
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileSpreadsheet className="h-4 w-4" />
                {preview.length} students found
              </div>
            </div>
          )}

          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            <div className="flex items-center gap-2 font-medium mb-1">
                <AlertCircle className="h-4 w-4" />
                Note
            </div>
            Default password will be set to their <strong>Student ID</strong>. Students can change it later.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? 'Importing...' : 'Import Students'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
