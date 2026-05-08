'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUniversity } from '@/actions/super-admin'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

type University = {
  id: string
  name: string
  slug: string
  domain: string | null
  allowedDomains: string[]
  logoUrl: string | null
  primaryColor: string | null
}

export function EditUniversityModal({ university }: { university: University }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: university.name,
    slug: university.slug,
    domain: university.domain || '',
    allowedDomains: university.allowedDomains.join(', '),
    logoUrl: university.logoUrl || '',
    primaryColor: university.primaryColor || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', formData.name)
    data.append('slug', formData.slug)
    data.append('domain', formData.domain)
    data.append('allowedDomains', formData.allowedDomains)
    data.append('logoUrl', formData.logoUrl)
    data.append('primaryColor', formData.primaryColor)

    const result = await updateUniversity(university.id, data)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('University updated successfully')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit University</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="allowedDomains">Allowed Domains (comma separated)</Label>
            <Input
              id="allowedDomains"
              value={formData.allowedDomains}
              onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              />
              <input
                type="color"
                value={formData.primaryColor || '#000000'}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="h-10 w-10 rounded border p-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
