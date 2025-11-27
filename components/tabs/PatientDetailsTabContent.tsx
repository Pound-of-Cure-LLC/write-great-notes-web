'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, UserX } from 'lucide-react'
import { useCapabilities, CAPABILITIES } from '@/lib/capabilities'

type PatientDetailsTabContentProps = {
  formData: {
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
    phone: string
    email: string
    mrn: string
    address_street: string
    address_city: string
    address_state: string
    address_zip: string
  }
  onFormDataChange: (data: Partial<PatientDetailsTabContentProps['formData']>) => void
  onSave: (e: React.FormEvent) => void
  onInactivate: () => void
  saving: boolean
  error: string
}

export function PatientDetailsTabContent({
  formData,
  onFormDataChange,
  onSave,
  onInactivate,
  saving,
  error,
}: PatientDetailsTabContentProps) {
  const capabilities = useCapabilities()

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSave}>
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
                  onChange={(e) => onFormDataChange({ first_name: e.target.value })}
                  required
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => onFormDataChange({ last_name: e.target.value })}
                  required
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
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
                  onChange={(e) => onFormDataChange({ date_of_birth: e.target.value })}
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => onFormDataChange({ gender: value })}
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                >
                  <SelectTrigger id="gender" disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}>
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
                  onChange={(e) => onFormDataChange({ phone: e.target.value })}
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormDataChange({ email: e.target.value })}
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                />
              </div>
            </div>

            {/* MRN */}
            <div className="space-y-2">
              <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
              <Input
                id="mrn"
                value={formData.mrn}
                onChange={(e) => onFormDataChange({ mrn: e.target.value })}
                disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
              />
            </div>

            {/* Address Fields - Visually Distinct Section */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Address Information</h3>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_street">Street Address</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => onFormDataChange({ address_street: e.target.value })}
                  disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                  placeholder="123 Main St"
                  className="bg-background"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => onFormDataChange({ address_city: e.target.value })}
                    disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                    placeholder="City"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">State</Label>
                  <Input
                    id="address_state"
                    value={formData.address_state}
                    onChange={(e) => onFormDataChange({ address_state: e.target.value })}
                    disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                    placeholder="CA"
                    maxLength={2}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_zip">ZIP Code</Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip}
                    onChange={(e) => onFormDataChange({ address_zip: e.target.value })}
                    disabled={!capabilities.has(CAPABILITIES.UPDATE_PATIENT)}
                    placeholder="12345"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {capabilities.has(CAPABILITIES.UPDATE_PATIENT) && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onInactivate}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Inactivate Patient
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
