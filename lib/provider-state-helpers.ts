/**
 * Provider State Helpers
 *
 * Utilities for extracting default state for provider search functionality.
 */

type Location = {
  id: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
}

type Organization = {
  default_location_id?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
}

/**
 * Find default state for provider search based on priority order:
 * 1. Organization's default location address state
 * 2. First available location's address state
 * 3. Organization's address state
 * 4. Empty string if none found
 *
 * @param locations - Array of locations
 * @param organization - Organization object with default_location_id and address
 * @returns State abbreviation (e.g., "CA") or empty string
 */
export function findDefaultState(
  locations: Location[],
  organization: Organization
): string {
  // 1. Try organization's default location
  if (organization.default_location_id) {
    const defaultLoc = locations.find(
      (l) => l.id === organization.default_location_id
    )
    if (defaultLoc?.address?.state) {
      return defaultLoc.address.state
    }
  }

  // 2. Try first available location
  if (locations.length > 0 && locations[0]?.address?.state) {
    return locations[0].address.state
  }

  // 3. Try organization address
  if (organization.address?.state) {
    return organization.address.state
  }

  // 4. No state found
  return ""
}

/**
 * Find default state from a selected location.
 * Used when user changes location selection.
 *
 * @param locationId - Selected location ID
 * @param locations - Array of locations
 * @returns State abbreviation or empty string
 */
export function findStateFromLocation(
  locationId: string,
  locations: Location[]
): string {
  const location = locations.find((l) => l.id === locationId)
  return location?.address?.state || ""
}
