'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus } from 'lucide-react'
import { apiPost } from '@/lib/api-client'
import { useCapabilities, CAPABILITIES } from '@/lib/capabilities'

export default function NewPatientPage() {
  const router = useRouter()
  const capabilities = useCapabilities()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Redirect if create_patient capability not available
  useEffect(() => {
    if (!capabilities.isLoading && !capabilities.has(CAPABILITIES.CREATE_PATIENT)) {
      router.push('/patients')
    }
  }, [capabilities, router])

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    mrn: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Clean up empty string values - convert to null for optional fields
      const cleanedData = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        phone: formData.phone || null,
        email: formData.email || null,
        mrn: formData.mrn || null,
      }

      await apiPost('/patients', cleanedData)
      router.push('/patients')
    } catch (err: any) {
      setError(err.message || 'Failed to create patient')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/patients')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Patients
      </Button>

      {/* New Patient Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    data-testid="patient-first-name-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    data-testid="patient-last-name-input"
                    required
                  />
                </div>
              </div>

              {/* DOB and Gender */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* MRN */}
              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
                <Input
                  id="mrn"
                  value={formData.mrn}
                  onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                  data-testid="patient-mrn-input"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving} data-testid="create-patient-submit">
                  <Plus className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Patient'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
