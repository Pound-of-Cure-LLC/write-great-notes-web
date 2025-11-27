"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiPost, apiPatch } from "@/lib/api-client";
import type { OrganizationProvider } from "@/types/providers";

type ProviderFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: OrganizationProvider | null; // If provided, we're editing
  onSuccess: (provider: OrganizationProvider) => void;
};

export function ProviderFormModal({
  open,
  onOpenChange,
  provider,
  onSuccess,
}: ProviderFormModalProps) {
  const isEditing = !!provider;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [providerName, setProviderName] = useState("");
  const [npi, setNpi] = useState("");
  const [credentials, setCredentials] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [notes, setNotes] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (provider) {
      setProviderName(provider.provider_name || "");
      setNpi(provider.npi || "");
      setCredentials(provider.credentials || "");
      setSpecialty(provider.specialty || "");
      setAddress(provider.address || "");
      setPhone(provider.phone || "");
      setFax(provider.fax || "");
      setNotes(provider.notes || "");
    } else {
      // Reset form for new provider
      setProviderName("");
      setNpi("");
      setCredentials("");
      setSpecialty("");
      setAddress("");
      setPhone("");
      setFax("");
      setNotes("");
    }
    setError(null);
  }, [provider, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        provider_name: providerName,
        npi: npi || null, // Optional - send null if empty
        credentials: credentials || null,
        specialty: specialty || null,
        address: address || null,
        phone: phone || null,
        fax: fax || null,
        notes: notes || null,
      };

      let result: OrganizationProvider;

      if (isEditing) {
        // Update existing provider
        result = await apiPatch<OrganizationProvider>(
          `/providers/${provider.id}`,
          payload
        );
      } else {
        // Create new custom provider
        result = await apiPost<OrganizationProvider>("/providers", payload);
      }

      onSuccess(result);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save provider:", err);
      setError(err.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Provider" : "Add New Provider"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update provider information. Changes will affect all referrals and patients using this provider."
              : "Add a new provider to your organization's directory. NPI number is optional."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="provider-name">
              Provider Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="provider-name"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Dr. Jane Smith"
              required
            />
          </div>

          {/* NPI - Optional */}
          <div className="space-y-2">
            <Label htmlFor="npi">NPI Number (Optional)</Label>
            <Input
              id="npi"
              value={npi}
              onChange={(e) => setNpi(e.target.value)}
              placeholder="1234567890"
              maxLength={10}
            />
            <p className="text-sm text-muted-foreground">
              10-digit National Provider Identifier (leave blank if not available)
            </p>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials</Label>
              <Input
                id="credentials"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                placeholder="MD, DO, NP, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Cardiology, Family Medicine, etc."
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Suite 200, City, ST 12345"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                type="tel"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="(555) 123-4568"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Organization-specific notes about this provider..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !providerName}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Provider"
                : "Add Provider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
