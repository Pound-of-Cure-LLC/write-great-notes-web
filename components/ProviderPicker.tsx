"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X, UserPlus } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  OrganizationProvider,
  NPIProvider,
  ProviderSearchResult,
  SelectedProvider,
} from "@/types/providers";

// Re-export SelectedProvider for convenience
export type { SelectedProvider } from "@/types/providers";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

type ProviderPickerProps = {
  selectedProviders: SelectedProvider[];
  onProvidersChange: (providers: SelectedProvider[]) => void;
  defaultState?: string;
  allowMultiple?: boolean;
  showCommunicationToggle?: boolean;
  required?: boolean;
};

export function ProviderPicker({
  selectedProviders,
  onProvidersChange,
  defaultState = "",
  allowMultiple = true,
  showCommunicationToggle = true,
  required = false,
}: ProviderPickerProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localResults, setLocalResults] = useState<OrganizationProvider[]>([]);
  const [npiResults, setNpiResults] = useState<NPIProvider[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchState, setSearchState] = useState<string>(defaultState);

  const searchProviders = async (query: string) => {
    if (!query || query.length < 3) {
      setLocalResults([]);
      setNpiResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      if (searchState) {
        params.append("state", searchState);
      }

      const results = await apiGet<ProviderSearchResult>(`/providers/search?${params.toString()}`);
      setLocalResults(results.local_results);
      setNpiResults(results.npi_results);
    } catch (error) {
      toast.error("Failed to search providers. Please try again.");
      setLocalResults([]);
      setNpiResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced provider search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchProviders(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchState]);

  // Add NPI provider to organization directory
  const addNPIProviderToDirectory = async (npiProvider: NPIProvider): Promise<OrganizationProvider | null> => {
    try {
      const result = await apiPost<OrganizationProvider>("/providers/from-npi", npiProvider);
      toast.success(`Added ${npiProvider.provider_name} to your directory`);
      return result;
    } catch (error) {
      toast.error("Failed to add provider to directory. Please try again.");
      return null;
    }
  };

  const handleSelectProvider = async (provider: OrganizationProvider) => {
    const isAlreadySelected = selectedProviders.some(p => p.id === provider.id);
    if (isAlreadySelected) return;

    const newProvider: SelectedProvider = {
      ...provider,
      is_primary: selectedProviders.length === 0, // First one is primary
      receives_communication: true, // Default to true
      is_referring: false, // Default to false
    };

    if (allowMultiple) {
      onProvidersChange([...selectedProviders, newProvider]);
    } else {
      onProvidersChange([newProvider]);
    }

    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSelectNPIProvider = async (npiProvider: NPIProvider) => {
    // Add to directory first
    const orgProvider = await addNPIProviderToDirectory(npiProvider);
    if (!orgProvider) return;

    // Add to local results for future searches
    setLocalResults([...localResults, orgProvider]);

    // Select the provider
    await handleSelectProvider(orgProvider);
  };

  const handleRemoveProvider = (providerId: string) => {
    const updated = selectedProviders.filter(p => p.id !== providerId);

    // If we removed the primary provider, make the first remaining one primary
    if (updated.length > 0) {
      const removedProvider = selectedProviders.find(p => p.id === providerId);
      if (removedProvider?.is_primary && updated[0]) {
        updated[0].is_primary = true;
      }
    }

    onProvidersChange(updated);
  };

  const handleTogglePrimary = (providerId: string) => {
    const updated = selectedProviders.map(p => ({
      ...p,
      is_primary: p.id === providerId,
    }));
    onProvidersChange(updated);
  };

  const handleToggleCommunication = (providerId: string) => {
    const updated = selectedProviders.map(p =>
      p.id === providerId
        ? { ...p, receives_communication: !p.receives_communication }
        : p
    );
    onProvidersChange(updated);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>
          Provider{allowMultiple ? "s" : ""} {required && <span className="text-destructive">*</span>}
        </Label>
        {allowMultiple && (
          <p className="text-sm text-muted-foreground mt-1">
            You can add multiple providers
          </p>
        )}
      </div>

      {/* Provider Search and State Dropdown */}
      <div className="flex gap-3">
        {/* Provider Search - 80% width */}
        <div className="flex-1 space-y-2">
          <Label>Search Provider</Label>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-full justify-between"
              >
                <span>Search for provider...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Type provider name..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {searchLoading ? (
                    <CommandEmpty>Searching...</CommandEmpty>
                  ) : localResults.length === 0 && npiResults.length === 0 ? (
                    <CommandEmpty>
                      <div className="px-4">
                        {searchQuery.length < 3
                          ? "Type at least 3 characters to search"
                          : "No providers found"}
                      </div>
                    </CommandEmpty>
                  ) : (
                    <>
                      {/* Local Organization Providers */}
                      {localResults.length > 0 && (
                        <CommandGroup heading="Your Directory">
                          {localResults.map((provider) => {
                            const isSelected = selectedProviders.some(p => p.id === provider.id);
                            return (
                              <CommandItem
                                key={provider.id}
                                value={provider.id}
                                onSelect={() => handleSelectProvider(provider)}
                                disabled={isSelected}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {provider.provider_name}
                                    {provider.credentials && ` ${provider.credentials}`}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {provider.address || "No address available"}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}

                      {/* NPI Registry Results */}
                      {npiResults.length > 0 && (
                        <CommandGroup heading="NPI Registry (Add to Directory)">
                          {npiResults.map((provider) => {
                            return (
                              <CommandItem
                                key={provider.npi}
                                value={provider.npi}
                                onSelect={() => handleSelectNPIProvider(provider)}
                              >
                                <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {provider.provider_name}
                                    {provider.credentials && ` ${provider.credentials}`}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {provider.address || "No address available"}
                                  </span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* State Dropdown - 20% width */}
        <div className="w-1/5 space-y-2">
          <Label htmlFor="search-state">State</Label>
          <Select value={searchState} onValueChange={setSearchState}>
            <SelectTrigger id="search-state">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Providers */}
      {selectedProviders.length > 0 && (
        <div className="space-y-2">
          {selectedProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between gap-2 p-3 border rounded-md"
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
              </div>

              <div className="flex items-center gap-2">
                {allowMultiple && (
                  <Badge
                    variant={provider.is_primary ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTogglePrimary(provider.id)}
                  >
                    {provider.is_primary ? "Primary" : "Set Primary"}
                  </Badge>
                )}

                {showCommunicationToggle && (
                  <Badge
                    variant={provider.receives_communication ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleToggleCommunication(provider.id)}
                  >
                    {provider.receives_communication ? "Gets Comms" : "No Comms"}
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveProvider(provider.id)}
                  className="hover:bg-muted rounded-sm p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
