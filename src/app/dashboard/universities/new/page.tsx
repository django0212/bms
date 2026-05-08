'use client'

import { createUniversity } from '@/actions/super-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function NewUniversityPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-2">Add University</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>University Details</CardTitle>
          <CardDescription>
            Enter the details for the new university.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { await createUniversity(formData) }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">University Name</Label>
              <Input id="name" name="name" placeholder="e.g. Massachusetts Institute of Technology" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="e.g. mit" required />
                <p className="text-xs text-muted-foreground">Used in URLs</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Primary Domain</Label>
                <Input id="domain" name="domain" placeholder="e.g. mit.edu" required />
                <p className="text-xs text-muted-foreground">Main email domain</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedDomains">Allowed Email Domains (Optional)</Label>
              <Input id="allowedDomains" name="allowedDomains" placeholder="e.g. mit.edu, alumni.mit.edu" />
              <p className="text-xs text-muted-foreground">Comma separated list of permissible email endings</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input id="logoUrl" name="logoUrl" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color (Optional)</Label>
              <div className="flex gap-2">
                <Input id="primaryColor" name="primaryColor" type="color" className="w-12 h-10 p-1" />
                <Input name="primaryColorText" placeholder="#000000" className="flex-1" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/universities">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit">Create University</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
