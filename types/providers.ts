/**
 * Provider Type Definitions
 *
 * Centralized types for organization provider management across the application.
 */

/**
 * Organization provider from the provider directory.
 * Represents a provider that has been added to the organization's directory,
 * either from NPI registry or created manually.
 */
export type OrganizationProvider = {
  id: string;
  organization_id: string;
  npi?: string;
  provider_name: string;
  credentials?: string;
  specialty?: string;
  address?: string;
  phone?: string;
  fax?: string;
  source: "npi" | "custom";
  notes?: string;
  is_active: boolean;
  external_provider_id?: string;  // EMR-specific provider ID (from emr_settings)
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
};

/**
 * NPI provider result from NPPES API registry search.
 * These are providers found in the national registry but not yet
 * added to the organization's directory.
 */
export type NPIProvider = {
  npi: string;
  provider_name: string;
  credentials?: string;
  specialty?: string;
  address?: string;
  phone?: string;
  fax?: string;
};

/**
 * Provider search results combining local directory and NPI registry.
 */
export type ProviderSearchResult = {
  local_results: OrganizationProvider[];
  npi_results: NPIProvider[];
};

/**
 * Provider with selection state for referral/patient forms.
 * Extends OrganizationProvider with additional fields for managing
 * provider associations with patients and referrals.
 */
export type SelectedProvider = OrganizationProvider & {
  is_primary: boolean;
  receives_communication: boolean;
  is_referring: boolean;
  notes?: string;
  state?: string;  // 2-letter state code (from Charm or extracted from address)
};

/**
 * Provider association data for creating/updating patient or referral providers.
 * This is the minimal data needed to associate a provider with a patient/referral.
 */
export type ProviderAssociation = {
  organization_provider_id: string;
  is_primary: boolean;
  receives_communication: boolean;
  is_referring: boolean;
  notes?: string;
};

/**
 * Patient-Provider linking record from API.
 * Represents the join of patient_providers with organization_providers table.
 */
export type PatientProviderLink = {
  organization_provider_id: string;
  is_primary: boolean;
  receives_communication: boolean;
  is_referring: boolean;
  notes?: string;
  provider?: OrganizationProvider;  // Joined from organization_providers table
  // Fallback fields when provider is not joined
  organization_id?: string;
  npi?: string;
  provider_name?: string;
  credentials?: string;
  specialty?: string;
  address?: string;
  phone?: string;
  fax?: string;
  source?: "npi" | "custom";
  is_active?: boolean;
  external_provider_id?: string;  // EMR-specific provider ID (from emr_settings)
};

/**
 * API Response types for provider endpoints
 */
export type ProvidersResponse = {
  providers: SelectedProvider[];
};

export type PatientProvidersResponse = {
  providers: PatientProviderLink[];
};
