"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { apiGet, apiPatch } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { logger } from "@/lib/logger";
interface CharmVital {
  vital_id: string
  vital_name: string
  vital_unit: string
  vital_type: string
}

interface VitalMetric {
  label: string
  key: string
  unit: string
}

interface VitalDefinition {
  id: string
  name: string
  is_pre_populated: boolean
  metrics: VitalMetric[]
  display_format: string
  emr_mapping: {
    charm_vitals?: Array<{
      metric_key: string
      charm_vital_id: string
      charm_vital_name: string
      charm_vital_unit: string
    }>
  }
}

export function VitalsMappingSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // vitalDefId-metricKey
  const [charmVitals, setCharmVitals] = useState<CharmVital[]>([])
  const [vitalDefinitions, setVitalDefinitions] = useState<VitalDefinition[]>([])
  const [mappings, setMappings] = useState<Record<string, Record<string, string>>>({}) // vitalDefId -> { metricKey -> charmVitalId }
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Charm vitals and organization vital definitions in parallel
      const [charmVitalsData, vitalDefsResponse] = await Promise.all([
        apiGet("/emr-connections/vitals"),
        apiGet("/vital-definitions")
      ])

      // Extract vital definitions array from response object
      const vitalDefsData = (vitalDefsResponse as any)?.vital_definitions || vitalDefsResponse

      // Ensure we have arrays, not objects or errors
      const typedCharmVitals = Array.isArray(charmVitalsData) ? charmVitalsData as CharmVital[] : []
      const typedVitalDefs = Array.isArray(vitalDefsData) ? vitalDefsData as VitalDefinition[] : []

      if (!Array.isArray(charmVitalsData)) {
        logger.error("Charm vitals API returned non-array:", charmVitalsData)
      }
      if (!Array.isArray(vitalDefsData)) {
        logger.error("Vital definitions API returned non-array:", vitalDefsData)
      }

      setCharmVitals(typedCharmVitals)
      setVitalDefinitions(typedVitalDefs)

      // Initialize mappings from existing emr_mapping data
      const initialMappings: Record<string, Record<string, string>> = {}
      typedVitalDefs.forEach((def: VitalDefinition) => {
        if (def.emr_mapping?.charm_vitals && Array.isArray(def.emr_mapping.charm_vitals)) {
          initialMappings[def.id] = {}
          def.emr_mapping.charm_vitals.forEach(mapping => {
            initialMappings[def.id]![mapping.metric_key] = mapping.charm_vital_id
          })
        }
      })
      setMappings(initialMappings)

    } catch (err: any) {
      logger.error("Error fetching vitals mapping data:", err)
      setError(err.message || "Failed to load vitals mapping data")
    } finally {
      setLoading(false)
    }
  }

  const handleMetricMapping = async (vitalDefId: string, metricKey: string, charmVitalId: string | null) => {
    try {
      const savingKey = `${vitalDefId}-${metricKey}`
      setSaving(savingKey)
      setError(null)

      // Update local state
      setMappings(prev => {
        const updated = { ...prev }
        if (!updated[vitalDefId]) {
          updated[vitalDefId] = {}
        }

        if (charmVitalId === null || charmVitalId === "none") {
          // Remove mapping
          delete updated[vitalDefId][metricKey]
        } else {
          // Add/update mapping
          updated[vitalDefId][metricKey] = charmVitalId
        }

        return updated
      })

      // Build charm_vitals array with metric_key
      const vitalDefMappings = mappings[vitalDefId] || {}
      const updatedMappings = { ...vitalDefMappings }

      if (charmVitalId === null || charmVitalId === "none") {
        delete updatedMappings[metricKey]
      } else {
        updatedMappings[metricKey] = charmVitalId
      }

      const charmVitalsArray = Object.entries(updatedMappings).map(([key, id]) => {
        const vital = charmVitals.find(v => v.vital_id === id)
        return {
          metric_key: key,
          charm_vital_id: id,
          charm_vital_name: vital?.vital_name || "",
          charm_vital_unit: vital?.vital_unit || ""
        }
      })

      // Update mapping on backend
      await apiPatch(`/vital-definitions/${vitalDefId}/mapping`, {
        charm_vitals: charmVitalsArray
      })

    } catch (err: any) {
      logger.error("Error updating vital mapping:", err)
      setError(err.message || "Failed to update mapping")
      // Revert local state on error
      await fetchData()
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals Mapping</CardTitle>
        <CardDescription>
          Map each vital metric to its corresponding Charm EMR vital. For example, map Blood Pressure's "Systolic" metric to Charm's "Systolic BP" vital.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-900">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {charmVitals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Charm vitals found. Please check your Charm EMR connection.
          </p>
        ) : (
          <div className="space-y-6">
            {vitalDefinitions.map((vitalDef) => {
              const vitalMappings = mappings[vitalDef.id] || {}

              return (
                <div key={vitalDef.id} className="p-4 border rounded-lg space-y-4">
                  {/* Vital Definition Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{vitalDef.name}</h3>
                        {vitalDef.is_pre_populated && (
                          <Badge variant="secondary" className="text-xs">
                            Pre-configured
                          </Badge>
                        )}
                      </div>
                      {vitalDef.display_format && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Format: <code className="bg-muted px-1 py-0.5 rounded">{vitalDef.display_format}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Mapping */}
                  {vitalDef.metrics && vitalDef.metrics.length > 0 ? (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      {vitalDef.metrics.map((metric) => {
                        const savingKey = `${vitalDef.id}-${metric.key}`
                        const isSaving = saving === savingKey
                        const selectedCharmVitalId = vitalMappings[metric.key]
                        const selectedCharmVital = selectedCharmVitalId
                          ? charmVitals.find(v => v.vital_id === selectedCharmVitalId)
                          : null

                        return (
                          <div key={metric.key} className="grid grid-cols-[200px_1fr] gap-4 items-center">
                            {/* Metric Info */}
                            <div>
                              <div className="font-medium text-sm">{metric.label}</div>
                              <div className="text-xs text-muted-foreground">
                                Key: <code className="bg-muted px-1 rounded">{metric.key}</code>
                                <span className="mx-1">•</span>
                                Unit: {metric.unit}
                              </div>
                            </div>

                            {/* Charm Vital Selector */}
                            <div className="flex items-center gap-2">
                              <Select
                                value={selectedCharmVitalId || "none"}
                                onValueChange={(value) => {
                                  const newValue = value === "none" ? null : value
                                  handleMetricMapping(vitalDef.id, metric.key, newValue)
                                }}
                                disabled={isSaving}
                              >
                                <SelectTrigger className="w-[250px]">
                                  <SelectValue placeholder="Select Charm vital..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    <span className="text-muted-foreground">Not mapped</span>
                                  </SelectItem>
                                  {charmVitals.map((charmVital) => (
                                    <SelectItem key={charmVital.vital_id} value={charmVital.vital_id}>
                                      {charmVital.vital_name} ({charmVital.vital_unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isSaving && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground pl-4">
                      No metrics defined for this vital. Please configure metrics in Organization Settings.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
