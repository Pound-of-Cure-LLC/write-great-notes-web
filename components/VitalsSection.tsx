"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { apiGet } from "@/lib/api-client"
import { logger } from "@/lib/logger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Vital, VitalDefinition, VitalEntry, VitalsResponse, VitalDefinitionsResponse } from "@/types"

export function VitalsSection({
  appointmentId,
  patientId,
  isReadOnly,
  vitals: prefetchedVitals,
  vitalDefinitions: prefetchedVitalDefinitions,
  loading: prefetchedLoading
}: {
  appointmentId: string
  patientId: string
  isReadOnly: boolean
  vitals?: Vital[]
  vitalDefinitions?: VitalDefinition[]
  loading?: boolean
}) {
  // Use prefetched data if provided, otherwise fetch
  const [vitals, setVitals] = useState<Vital[]>(prefetchedVitals || [])
  const [vitalDefinitions, setVitalDefinitions] = useState<VitalDefinition[]>(prefetchedVitalDefinitions || [])
  const [loading, setLoading] = useState(prefetchedLoading !== undefined ? prefetchedLoading : true)

  // Update state when prefetched data changes
  useEffect(() => {
    if (prefetchedVitals !== undefined) {
      setVitals(prefetchedVitals)
    }
  }, [prefetchedVitals])

  useEffect(() => {
    if (prefetchedVitalDefinitions !== undefined) {
      // Ensure we have an array (defensive check for production data issues)
      const defsArray = Array.isArray(prefetchedVitalDefinitions)
        ? prefetchedVitalDefinitions
        : []

      // Sort vital definitions by display_order
      const sortedDefs = defsArray.sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      )
      setVitalDefinitions(sortedDefs)
    }
  }, [prefetchedVitalDefinitions])

  useEffect(() => {
    if (prefetchedLoading !== undefined) {
      setLoading(prefetchedLoading)
    }
  }, [prefetchedLoading])

  // Fallback: fetch data if not prefetched
  useEffect(() => {
    const fetchData = async () => {
      if (prefetchedVitals === undefined && patientId) {
        setLoading(true)
        try {
          const [vitalsData, vitalDefsData] = await Promise.all([
            apiGet<VitalsResponse>(`/vitals/by-patient/${patientId}`),
            apiGet<VitalDefinitionsResponse>('/vital-definitions')
          ])

          setVitals(vitalsData.vitals)

          // Defensive check: ensure we have an array
          const defsArray = Array.isArray(vitalDefsData.vital_definitions)
            ? vitalDefsData.vital_definitions
            : Array.isArray(vitalDefsData)
            ? vitalDefsData
            : []

          const sortedDefs = defsArray.sort(
            (a, b) => (a.display_order || 0) - (b.display_order || 0)
          )
          setVitalDefinitions(sortedDefs)
        } catch (error) {
          logger.error("Error fetching vitals:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [patientId, prefetchedVitals])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatValue = (value: any): string => {
    // Remove trailing zeros and unnecessary decimal points
    // "192.0" -> "192", "98.6" -> "98.6", "6.0" -> "6"
    const num = parseFloat(value)
    if (isNaN(num)) {
      return String(value)
    }
    // Use toString() to automatically remove trailing zeros
    return num.toString()
  }

  const applyDisplayFormat = (vitalValue: any, displayFormat: string, metrics: VitalDefinition['metrics']): string => {
    if (!displayFormat) {
      // Fallback: just show all values
      const values = Object.entries(vitalValue).map(([k, v]) => formatValue(v)).join(', ')
      return values || 'N/A'
    }

    // Replace placeholders like {feet}, {inches}, {sbp}, {dbp} with actual values
    let result = displayFormat
    for (const metric of metrics) {
      const placeholder = `{${metric.key}}`
      const value = vitalValue[metric.key]
      if (value !== undefined && value !== null) {
        result = result.replace(placeholder, formatValue(value))
      } else {
        // If missing a metric value, show N/A
        result = result.replace(placeholder, '--')
      }
    }

    return result
  }

  // Group vitals by date/time
  const groupVitalsByDate = (): VitalEntry[] => {
    const entriesMap = new Map<string, { [vitalDefName: string]: string }>()

    // Group vitals by recorded_at timestamp
    for (const vital of vitals) {
      const dateKey = vital.recorded_at
      if (!entriesMap.has(dateKey)) {
        entriesMap.set(dateKey, {})
      }

      // Find vital definition for this vital
      const vitalDef = vitalDefinitions.find(vd => vd.name === vital.vital_name)
      if (!vitalDef) continue

      const formattedValue = applyDisplayFormat(
        vital.vital_value,
        vitalDef.display_format,
        vitalDef.metrics
      )

      entriesMap.get(dateKey)![vital.vital_name] = formattedValue
    }

    // Convert to array and sort by date descending
    const entries: VitalEntry[] = Array.from(entriesMap.entries()).map(([date, vitals]) => ({
      date,
      vitals
    }))

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return entries
  }

  const vitalEntries = groupVitalsByDate()

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
      <CardContent className="p-6">
        {vitalEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vitals recorded</p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs">Date & Time</TableHead>
                  {vitalDefinitions.map((vd) => (
                    <TableHead key={vd.id} className="font-semibold text-xs">
                      {vd.name}
                      {vd.metrics[0]?.unit && ` (${vd.metrics[0].unit})`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitalEntries.map((entry, index) => (
                  <TableRow key={index} className={index % 2 === 1 ? "bg-muted/30" : ""}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    {vitalDefinitions.map((vd) => (
                      <TableCell key={vd.id} className="text-xs">
                        {entry.vitals[vd.name] || '--'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
