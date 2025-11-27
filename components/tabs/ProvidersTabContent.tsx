"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProviderPicker, SelectedProvider } from "@/components/ProviderPicker";
import { apiPatch } from "@/lib/api-client";
import { Loader2, Save, Stethoscope, X } from "lucide-react";

type ProvidersTabContentProps = {
  patientId: string;
  initialProviders: SelectedProvider[];
  onUpdate: () => void;
  defaultState?: string;
  isLocalPatient?: boolean; // No longer used - hybrid approach allows provider management for all patients
};

export function ProvidersTabContent({
  patientId,
  initialProviders,
  onUpdate,
  defaultState,
}: ProvidersTabContentProps) {
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>(initialProviders);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const handleProvidersChange = (providers: SelectedProvider[]) => {
    // Merge new providers with existing ones (ProviderPicker passes only new selections)
    const newProviders = providers.filter(
      p => !selectedProviders.some(existing => existing.id === p.id)
    );
    if (newProviders.length > 0) {
      setSelectedProviders([...selectedProviders, ...newProviders]);
      setHasChanges(true);
    }
  };

  const handleCheckboxChange = (
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
    setHasChanges(true);
  };

  const handleRemoveProvider = (providerId: string) => {
    const updated = selectedProviders.filter((p) => p.id !== providerId);
    setSelectedProviders(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // Update patient providers - send full provider data for EMR providers
      await apiPatch(`/patients/${patientId}`, {
        providers: selectedProviders.map((p) => ({
          organization_provider_id: p.id,
          external_provider_id: p.external_provider_id || null,
          provider_name: p.provider_name,
          npi: p.npi || null,
          phone: p.phone || null,
          // Use state field directly if available (from Charm), otherwise extract from address
          state: p.state || (p.address ? extractState(p.address) : null),
          is_primary: p.is_primary,
          receives_communication: p.receives_communication,
          is_referring: p.is_referring,
          notes: p.notes || null,
        })),
      });

      setHasChanges(false);
      onUpdate();
    } catch (err: any) {
      console.error("Failed to update providers:", err);
      setError(err.message || "Failed to update providers");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to extract state from address string
  const extractState = (address: string): string | null => {
    // Try to extract 2-letter state code from address
    // Format: "address, CITY, ST ZIP" or similar
    const stateMatch = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
    return stateMatch ? (stateMatch[1] ?? null) : null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Providers</CardTitle>
        <CardDescription>
          Manage the providers associated with this patient
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <ProviderPicker
            selectedProviders={[]} // Pass empty array to hide duplicate display
            onProvidersChange={handleProvidersChange}
            allowMultiple={true}
            showCommunicationToggle={false}
            required={false}
            {...(defaultState && { defaultState })}
          />
        </div>

        {selectedProviders.length === 0 ? (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No providers assigned to this patient yet
            </p>
            <p className="text-sm text-muted-foreground">
              Use the search above to add providers from your organization's directory
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selected Providers</Label>
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
                          handleCheckboxChange(provider.id, "is_primary")
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
                          handleCheckboxChange(provider.id, "receives_communication")
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
                          handleCheckboxChange(provider.id, "is_referring")
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

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => {
              setSelectedProviders(initialProviders);
              setHasChanges(false);
            }} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
