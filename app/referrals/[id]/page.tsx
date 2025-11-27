"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  UserCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Building2,
  X,
} from "lucide-react";
import { apiGet, apiPatch, apiDelete, apiPost } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ProviderPicker, SelectedProvider } from "@/components/ProviderPicker";
import { useDefaultProviderState } from "@/hooks/useDefaultProviderState";
import { findStateFromLocation } from "@/lib/provider-state-helpers";

type Provider = {
  id: string;
  referral_id: string;
  organization_provider_id: string;
  is_primary: boolean;
  receives_communication: boolean;
  is_referring: boolean;
  notes: string | null;
  npi: string | null;
  provider_name: string | null;
  credentials: string | null;
  specialty: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
};

type Referral = {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  location_id: string | null;
  referral_source_id: string | null;
  possible_duplicate_patient_id: string | null;
  possible_duplicate_referral_id: string | null;
  patient_id: string | null;
  converted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  current_status: {
    status_id: string;
    status_name: string;
    created_at: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  referral_source: {
    id: string;
    name: string;
  } | null;
  providers: Provider[];
};

type ReferralStatus = {
  id: string;
  name: string;
  display_order: number;
  is_pre_configured: boolean;
  is_read_only: boolean;
};

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

type ReferralSource = {
  id: string;
  name: string;
  requires_npi: boolean;
};

type StatusHistoryEntry = {
  id: string;
  status_name: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
};

export default function ReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statuses, setStatuses] = useState<ReferralStatus[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [statusChangeNotes, setStatusChangeNotes] = useState("");
  const [convertNotes, setConvertNotes] = useState("");

  // Location, source, and provider state
  const [locations, setLocations] = useState<Location[]>([]);
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [currentState, setCurrentState] = useState<string>("");

  // Use hook to get default state
  const { defaultState } = useDefaultProviderState();

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    location_id: "",
    referral_source_id: "",
    notes: "",
  });

  useEffect(() => {
    loadReferral();
    loadStatuses();
    loadStatusHistory();
    loadLocations();
    loadReferralSources();
  }, [referralId]);

  // Set default state for provider search
  useEffect(() => {
    if (defaultState) {
      setCurrentState(defaultState);
    }
  }, [defaultState]);

  const loadReferral = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Referral>(`/referrals/${referralId}`);
      setReferral(data);
      setEditForm({
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        phone: data.phone || "",
        email: data.email || "",
        address_street: (data as any).address?.street || "",
        address_city: (data as any).address?.city || "",
        address_state: (data as any).address?.state || "",
        address_zip: (data as any).address?.zip || "",
        location_id: data.location_id || "",
        referral_source_id: data.referral_source_id || "",
        notes: data.notes || "",
      });

      // Set providers for editing
      setSelectedProviders(
        data.providers.map((p) => {
          const provider: SelectedProvider = {
            id: p.organization_provider_id,
            organization_id: data.organization_id,
            provider_name: p.provider_name || "",
            source: "custom" as const,
            is_active: true,
            is_primary: p.is_primary,
            receives_communication: p.receives_communication,
            is_referring: p.is_referring ?? false,
          };
          if (p.npi) provider.npi = p.npi;
          if (p.credentials) provider.credentials = p.credentials;
          if (p.specialty) provider.specialty = p.specialty;
          if (p.address) provider.address = p.address;
          if (p.phone) provider.phone = p.phone;
          if (p.fax) provider.fax = p.fax;
          if (p.notes) provider.notes = p.notes;
          return provider;
        })
      );

      // Update state based on location
      if (data.location_id) {
        const state = findStateFromLocation(data.location_id, locations);
        if (state) {
          setCurrentState(state);
        }
      }
    } catch (error) {
      console.error("Failed to load referral:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await apiGet<ReferralStatus[]>("/referral-statuses");
      setStatuses(data);
    } catch (error) {
      console.error("Failed to load statuses:", error);
    }
  };

  const loadStatusHistory = async () => {
    try {
      const data = await apiGet<StatusHistoryEntry[]>(`/referrals/${referralId}/status-history`);
      setStatusHistory(data);
    } catch (error) {
      console.error("Failed to load status history:", error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await apiGet<Location[]>("/locations");
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  };

  // Auto-save provider changes
  const handleProviderCheckboxChange = async (
    providerId: string,
    field: "is_primary" | "receives_communication" | "is_referring"
  ) => {
    const updated = selectedProviders.map((p) => {
      if (p.id === providerId) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    });
    setSelectedProviders(updated);

    // Auto-save to backend
    try {
      await apiPatch(`/referrals/${referralId}`, {
        providers: updated.map((provider) => ({
          organization_provider_id: provider.id,
          is_primary: provider.is_primary,
          receives_communication: provider.receives_communication,
          is_referring: provider.is_referring,
          notes: provider.notes || null,
        })),
      });
      await loadReferral(); // Reload to get updated data
    } catch (error: any) {
      console.error("Failed to update provider:", error);
      alert(error.message || "Failed to update provider");
      // Revert on error
      setSelectedProviders(selectedProviders);
    }
  };

  const handleRemoveProvider = async (providerId: string) => {
    const updated = selectedProviders.filter((p) => p.id !== providerId);
    setSelectedProviders(updated);

    // Auto-save to backend
    try {
      await apiPatch(`/referrals/${referralId}`, {
        providers: updated.map((provider) => ({
          organization_provider_id: provider.id,
          is_primary: provider.is_primary,
          receives_communication: provider.receives_communication,
          is_referring: provider.is_referring,
          notes: provider.notes || null,
        })),
      });
      await loadReferral(); // Reload to get updated data
    } catch (error: any) {
      console.error("Failed to remove provider:", error);
      alert(error.message || "Failed to remove provider");
      // Revert on error
      setSelectedProviders(selectedProviders);
    }
  };

  const handleProvidersChange = async (providers: SelectedProvider[]) => {
    setSelectedProviders(providers);

    // Auto-save to backend
    try {
      await apiPatch(`/referrals/${referralId}`, {
        providers: providers.map((provider) => ({
          organization_provider_id: provider.id,
          is_primary: provider.is_primary,
          receives_communication: provider.receives_communication,
          is_referring: provider.is_referring,
          notes: provider.notes || null,
        })),
      });
      await loadReferral(); // Reload to get updated data
    } catch (error: any) {
      console.error("Failed to update providers:", error);
      alert(error.message || "Failed to update providers");
      // Revert on error
      await loadReferral();
    }
  };

  const loadReferralSources = async () => {
    try {
      const data = await apiGet<ReferralSource[]>("/referral-sources");
      setReferralSources(data);
    } catch (error) {
      console.error("Failed to load referral sources:", error);
    }
  };

  const handleSave = async () => {
    if (!referral) return;

    setIsSaving(true);
    try {
      const payload = {
        ...editForm,
        address: (editForm.address_street || editForm.address_city || editForm.address_state || editForm.address_zip) ? {
          street: editForm.address_street || null,
          city: editForm.address_city || null,
          state: editForm.address_state || null,
          zip: editForm.address_zip || null,
        } : null,
        providers: selectedProviders.map((provider) => ({
          organization_provider_id: provider.id,
          is_primary: provider.is_primary,
          receives_communication: provider.receives_communication,
          is_referring: provider.is_referring,
          notes: provider.notes || null,
        })),
      };

      // Remove address fields from root level
      delete (payload as any).address_street;
      delete (payload as any).address_city;
      delete (payload as any).address_state;
      delete (payload as any).address_zip;

      await apiPatch(`/referrals/${referralId}`, payload);
      await loadReferral();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update referral:", error);
      alert(error.message || "Failed to update referral");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocationChange = (newLocationId: string) => {
    setEditForm({ ...editForm, location_id: newLocationId });

    // Update state based on selected location
    const state = findStateFromLocation(newLocationId, locations);
    if (state) {
      setCurrentState(state);
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/referrals/${referralId}`);
      router.push("/referrals");
    } catch (error: any) {
      console.error("Failed to delete referral:", error);
      alert(error.message || "Failed to delete referral");
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatusId) return;

    try {
      await apiPost(`/referrals/${referralId}/status`, {
        status_id: selectedStatusId,
        notes: statusChangeNotes || null,
      });
      await loadReferral();
      await loadStatusHistory();
      setShowStatusChangeDialog(false);
      setStatusChangeNotes("");
      setSelectedStatusId("");
    } catch (error: any) {
      console.error("Failed to change status:", error);
      alert(error.message || "Failed to change status");
    }
  };

  const handleConvert = async () => {
    try {
      await apiPost(`/referrals/${referralId}/convert`, {
        notes: convertNotes || null,
      });
      await loadReferral();
      setShowConvertDialog(false);
      setConvertNotes("");
    } catch (error: any) {
      console.error("Failed to convert referral:", error);
      alert(error.message || "Failed to convert referral");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (statusName: string | undefined) => {
    switch (statusName) {
      case "New":
        return "default";
      case "Converted":
        return "default";
      case "Inactive":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading referral details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!referral) {
    return (
      <AppLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Referral not found</p>
            <Button onClick={() => router.push("/referrals")} className="mt-4">
              Back to Referrals
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isConverted = referral.patient_id !== null;
  const canEdit = !isConverted;
  const canChangeStatus = !isConverted;
  const canConvert = !isConverted && referral.current_status?.status_name !== "Inactive";

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/referrals")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {referral.first_name} {referral.last_name}
                </h1>
                <Badge variant={getStatusBadgeVariant(referral.current_status?.status_name)}>
                  {referral.current_status?.status_name || "Unknown"}
                </Badge>
                {(referral.possible_duplicate_patient_id ||
                  referral.possible_duplicate_referral_id) && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Possible Duplicate
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Created {formatDate(referral.created_at)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {canChangeStatus && (
              <Button
                variant="outline"
                onClick={() => setShowStatusChangeDialog(true)}
              >
                Change Status
              </Button>
            )}
            {canConvert && (
              <Button onClick={() => setShowConvertDialog(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Convert to Patient
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canEdit && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Converted Alert */}
        {isConverted && (
          <Alert>
            <UserCheck className="h-4 w-4" />
            <AlertDescription>
              This referral was converted to a patient on{" "}
              {referral.converted_at && formatDateTime(referral.converted_at)}.
              Editing is no longer available.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, first_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, last_name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={editForm.date_of_birth}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date_of_birth: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={editForm.gender}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, gender: value })
                          }
                        >
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-sm">Address</h4>
                      <div className="space-y-2">
                        <Label htmlFor="address_street">Street</Label>
                        <Input
                          id="address_street"
                          value={editForm.address_street}
                          onChange={(e) =>
                            setEditForm({ ...editForm, address_street: e.target.value })
                          }
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address_city">City</Label>
                          <Input
                            id="address_city"
                            value={editForm.address_city}
                            onChange={(e) =>
                              setEditForm({ ...editForm, address_city: e.target.value })
                            }
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_state">State</Label>
                          <Input
                            id="address_state"
                            value={editForm.address_state}
                            onChange={(e) =>
                              setEditForm({ ...editForm, address_state: e.target.value })
                            }
                            placeholder="CA"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_zip">ZIP</Label>
                          <Input
                            id="address_zip"
                            value={editForm.address_zip}
                            onChange={(e) =>
                              setEditForm({ ...editForm, address_zip: e.target.value })
                            }
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            first_name: referral.first_name,
                            last_name: referral.last_name,
                            date_of_birth: referral.date_of_birth || "",
                            gender: referral.gender || "",
                            phone: referral.phone || "",
                            email: referral.email || "",
                            address_street: referral.address?.street || "",
                            address_city: referral.address?.city || "",
                            address_state: referral.address?.state || "",
                            address_zip: referral.address?.zip || "",
                            location_id: referral.location_id || "",
                            referral_source_id: referral.referral_source_id || "",
                            notes: referral.notes || "",
                          });
                          setSelectedProviders(
                            referral.providers.map((p) => {
                              const provider: SelectedProvider = {
                                id: p.organization_provider_id,
                                organization_id: referral.organization_id,
                                provider_name: p.provider_name || "",
                                source: "custom" as const,
                                is_active: true,
                                is_primary: p.is_primary,
                                receives_communication: p.receives_communication,
                                is_referring: p.is_referring ?? false,
                              };
                              if (p.npi) provider.npi = p.npi;
                              if (p.credentials) provider.credentials = p.credentials;
                              if (p.specialty) provider.specialty = p.specialty;
                              if (p.address) provider.address = p.address;
                              if (p.phone) provider.phone = p.phone;
                              if (p.fax) provider.fax = p.fax;
                              if (p.notes) provider.notes = p.notes;
                              return provider;
                            })
                          );
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">
                            {referral.date_of_birth
                              ? formatDate(referral.date_of_birth)
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium">{referral.gender || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{referral.phone || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{referral.email || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Display */}
                    {referral.address && (referral.address.street || referral.address.city || referral.address.state || referral.address.zip) && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                        <div className="font-medium">
                          {referral.address.street && <p>{referral.address.street}</p>}
                          {(referral.address.city || referral.address.state || referral.address.zip) && (
                            <p>
                              {referral.address.city && `${referral.address.city}`}
                              {referral.address.state && `, ${referral.address.state}`}
                              {referral.address.zip && ` ${referral.address.zip}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Referral Details */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select
                          value={editForm.location_id}
                          onValueChange={handleLocationChange}
                        >
                          <SelectTrigger id="location">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="referral_source">Referral Source</Label>
                        <Select
                          value={editForm.referral_source_id}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, referral_source_id: value })
                          }
                        >
                          <SelectTrigger id="referral_source">
                            <SelectValue placeholder="Select referral source" />
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

                    {/* Referring Providers Edit */}
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Referring Providers</h4>
                      <ProviderPicker
                        selectedProviders={selectedProviders}
                        onProvidersChange={handleProvidersChange}
                        defaultState={currentState}
                        showCommunicationToggle={false}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {referral.location?.name || "Not assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Referral Source</p>
                          <p className="font-medium">
                            {referral.referral_source?.name || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Referring Providers */}
                    {!isConverted && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Referring Providers</h4>

                        <ProviderPicker
                          selectedProviders={selectedProviders}
                          onProvidersChange={handleProvidersChange}
                          defaultState={currentState}
                          showCommunicationToggle={false}
                        />

                        {selectedProviders.length > 0 && (
                          <div className="space-y-3 mt-4">
                            {selectedProviders.map((provider) => (
                              <div
                                key={provider.id}
                                className="flex items-start justify-between gap-4 p-4 border rounded-md"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {provider.provider_name}
                                    {provider.credentials && ` ${provider.credentials}`}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {provider.address || "No address"}
                                    {provider.npi && ` • NPI: ${provider.npi}`}
                                  </div>

                                  {/* Checkboxes */}
                                  <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`pcp-${provider.id}`}
                                        checked={provider.is_primary}
                                        onCheckedChange={() =>
                                          handleProviderCheckboxChange(provider.id, "is_primary")
                                        }
                                      />
                                      <Label
                                        htmlFor={`pcp-${provider.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        PCP
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`comms-${provider.id}`}
                                        checked={provider.receives_communication}
                                        onCheckedChange={() =>
                                          handleProviderCheckboxChange(provider.id, "receives_communication")
                                        }
                                      />
                                      <Label
                                        htmlFor={`comms-${provider.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        Gets Communication
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`referring-${provider.id}`}
                                        checked={provider.is_referring}
                                        onCheckedChange={() =>
                                          handleProviderCheckboxChange(provider.id, "is_referring")
                                        }
                                      />
                                      <Label
                                        htmlFor={`referring-${provider.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        Referring Provider
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveProvider(provider.id)}
                                  className="hover:bg-muted rounded-sm p-1 mt-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    placeholder="Add notes about this referral..."
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {referral.notes || "No notes added"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status changes yet</p>
                ) : (
                  <div className="space-y-3">
                    {statusHistory.map((entry) => (
                      <div key={entry.id} className="border-l-2 pl-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.status_name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Referral</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this referral? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Patient Dialog */}
        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert to Patient</DialogTitle>
              <DialogDescription>
                This will create a new patient record and mark this referral as converted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="convert-notes">Notes (Optional)</Label>
                <Textarea
                  id="convert-notes"
                  value={convertNotes}
                  onChange={(e) => setConvertNotes(e.target.value)}
                  placeholder="Add notes about this conversion..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConvertDialog(false);
                  setConvertNotes("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConvert}>
                <UserCheck className="h-4 w-4 mr-2" />
                Convert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Status Dialog */}
        <Dialog open={showStatusChangeDialog} onOpenChange={setShowStatusChangeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Status</DialogTitle>
              <DialogDescription>
                Update the referral status and optionally add notes about the change.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-status">New Status</Label>
                <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
                  <SelectTrigger id="new-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses
                      .filter((s) => !s.is_read_only)
                      .map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-notes">Notes (Optional)</Label>
                <Textarea
                  id="status-notes"
                  value={statusChangeNotes}
                  onChange={(e) => setStatusChangeNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusChangeDialog(false);
                  setStatusChangeNotes("");
                  setSelectedStatusId("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusChange} disabled={!selectedStatusId}>
                Change Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
