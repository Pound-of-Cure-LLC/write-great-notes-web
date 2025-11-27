/**
 * Vital signs and vital definitions types
 */

export interface Vital {
  id: string | null
  vital_name: string
  vital_value: {
    [key: string]: string | number | null
  }
  recorded_at: string
  recorded_by: string | null
}

export interface VitalMetric {
  key: string
  unit: string
  label: string
}

export interface VitalDefinition {
  id: string
  name: string
  display_format: string
  metrics: VitalMetric[]
  display_order: number
}

export interface VitalEntry {
  date: string
  vitals: { [vitalDefName: string]: string }
}

// API Response types
export interface VitalsResponse {
  vitals: Vital[]
}

export interface VitalDefinitionsResponse {
  vital_definitions: VitalDefinition[]
}
