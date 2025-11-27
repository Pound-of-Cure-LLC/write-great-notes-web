/**
 * useDefaultProviderState Hook
 *
 * React hook for fetching and determining default state for provider search.
 * Handles loading state and automatically extracts state based on priority:
 * 1. Organization's default location
 * 2. First available location
 * 3. Organization address
 */

import { useState, useEffect } from "react"
import { apiGet } from "@/lib/api-client"
import { findDefaultState } from "@/lib/provider-state-helpers"

type Location = {
  id: string
  name: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
}

type Organization = {
  id: string
  default_location_id?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
}

export function useDefaultProviderState() {
  const [defaultState, setDefaultState] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<Location[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    async function fetchDefaultState() {
      try {
        setLoading(true)

        // Fetch organization and locations in parallel
        const [org, locs] = await Promise.all([
          apiGet<Organization>("/organizations/me"),
          apiGet<Location[]>("/locations"),
        ])

        setOrganization(org)
        setLocations(locs)

        // Extract default state using priority order
        const state = findDefaultState(locs, org)
        setDefaultState(state)
      } catch (error) {
        console.error("Failed to fetch default provider state:", error)
        setDefaultState("")
      } finally {
        setLoading(false)
      }
    }

    fetchDefaultState()
  }, [])

  return {
    defaultState,
    loading,
    locations,
    organization,
  }
}
