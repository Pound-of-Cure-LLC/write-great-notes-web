"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, AlertTriangle } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProviderPicker, SelectedProvider } from "@/components/ProviderPicker";
import { useDefaultProviderState } from "@/hooks/useDefaultProviderState";
import { findStateFromLocation } from "@/lib/provider-state-helpers";

type Location = {
  id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

type Organization = {
  id: string;
  default_location_id?: string;
  address?: {
    state?: string;
  };
};

type ReferralSource = {
  id: string;
  name: string;
  requires_npi: boolean;
};

type DuplicateWarning = {
  patient_id?: string;
  referral_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone?: string;
  message?: string;
};

export default function NewReferralPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

  // Use hook to get default state and locations
  const {
    defaultState,
    loading: stateLoading,
    locations,
    organization,
  } = useDefaultProviderState();

  // Provider state - using ProviderPicker component
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [currentState, setCurrentState] = useState<string>("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [locationId, setLocationId] = useState("");
  const [referralSourceId, setReferralSourceId] = useState("");
  const [notes, setNotes] = useState("");

  // Load referral sources on mount
  useEffect(() => {
    loadReferralSources();
  }, []);

  // Set default location and state when hook data loads
  useEffect(() => {
    if (!stateLoading && organization && locations.length > 0) {
      // Set default location
      if (organization.default_location_id) {
        setLocationId(organization.default_location_id);
      } else if (locations[0]) {
        setLocationId(locations[0].id);
      }

      // Set default state for provider search
      setCurrentState(defaultState);
    }
  }, [stateLoading, organization, locations, defaultState]);

  const loadReferralSources = async () => {
    try {
      const data = await apiGet<ReferralSource[]>("/referral-sources");
      setReferralSources(data);
    } catch (error) {
      console.error("Failed to load referral sources:", error);
    }
  };

  const selectedSource = referralSources.find((s) => s.id === referralSourceId);
  const requiresNpi = selectedSource?.requires_npi || false;

  const handleLocationChange = (newLocationId: string) => {
    setLocationId(newLocationId);

    // Update state based on selected location
    const state = findStateFromLocation(newLocationId, locations);
    if (state) {
      setCurrentState(state);
    }
  };

  const handleSubmit = async (e: React.FormEvent, overrideDuplicate = false) => {
    e.preventDefault();
    setLoading(true);
    setDuplicateWarning(null);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        phone: phone || null,
        email: email || null,
        address: (addressStreet || addressCity || addressState || addressZip) ? {
          street: addressStreet || null,
          city: addressCity || null,
          state: addressState || null,
          zip: addressZip || null,
        } : null,
        location_id: locationId,
        referral_source_id: referralSourceId,
        providers: selectedProviders.map((provider) => ({
          organization_provider_id: provider.id,
          is_primary: provider.is_primary,
          receives_communication: provider.receives_communication,
          is_referring: provider.is_referring,
          notes: provider.notes || null,
        })),
        notes: notes || null,
        duplicate_override: overrideDuplicate,
        possible_duplicate_patient_id: duplicateWarning?.patient_id || null,
        possible_duplicate_referral_id: duplicateWarning?.referral_id || null,
      };

      const result = await apiPost("/referrals", payload) as any;

      // Success - redirect to referrals list
      router.push("/referrals");
    } catch (error: any) {
      console.error("Failed to create referral:", error);

      // Check if this is a duplicate error (409 Conflict)
      if (error.detail && (error.detail.duplicate_type === 'patient' || error.detail.duplicate_type === 'referral')) {
        // Convert backend duplicate format to frontend format
        const duplicateData = error.detail.duplicate_data || {};
        setDuplicateWarning({
          patient_id: error.detail.duplicate_type === 'patient' ? error.detail.duplicate_id : undefined,
          referral_id: error.detail.duplicate_type === 'referral' ? error.detail.duplicate_id : undefined,
          first_name: duplicateData.first_name || '',
          last_name: duplicateData.last_name || '',
          date_of_birth: duplicateData.date_of_birth,
          phone: duplicateData.phone,
          message: error.detail.message || error.message,
        });
        setLoading(false);
        return;
      }

      // Other errors - show alert
      alert(error.message || "Failed to create referral");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!firstName || !lastName || !locationId || !referralSourceId) {
      return false;
    }
    if (requiresNpi && selectedProviders.length === 0) {
      return false;
    }
    return true;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/referrals")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Referral</h1>
            <p className="text-muted-foreground mt-1">Add a new patient referral</p>
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Possible duplicate detected!</p>
                <p>
                  A {duplicateWarning.patient_id ? "patient" : "referral"} with similar information
                  already exists:
                </p>
                <p className="text-sm">
                  <strong>
                    {duplicateWarning.first_name} {duplicateWarning.last_name}
                  </strong>
                  {duplicateWarning.date_of_birth && ` • DOB: ${duplicateWarning.date_of_birth}`}
                  {duplicateWarning.phone && ` • Phone: ${duplicateWarning.phone}`}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDuplicateWarning(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    Create Anyway
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Information</CardTitle>
            <CardDescription>Enter the patient referral details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="addressStreet">Street Address</Label>
                  <Input
                    id="addressStreet"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity">City</Label>
                    <Input
                      id="addressCity"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState">State</Label>
                    <Input
                      id="addressState"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressZip">ZIP Code</Label>
                    <Input
                      id="addressZip"
                      value={addressZip}
                      onChange={(e) => setAddressZip(e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              {/* Referral Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Referral Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Select value={locationId} onValueChange={handleLocationChange} required>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referralSource">
                      Referral Source <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={referralSourceId}
                      onValueChange={setReferralSourceId}
                      required
                    >
                      <SelectTrigger id="referralSource">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Provider Picker Component */}
                {requiresNpi && (
                  <ProviderPicker
                    selectedProviders={selectedProviders}
                    onProvidersChange={setSelectedProviders}
                    defaultState={currentState}
                    allowMultiple={true}
                    showCommunicationToggle={true}
                    required={true}
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this referral..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/referrals")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !isFormValid()}>
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Referral
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
