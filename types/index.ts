export type ActivityType = "Mechanical" | "Electrical" | "Civil" | "Structural" | "Piping" | "Instrumentation"
export type Responsibility = "HCC" | "ALKE" | "PWA" | "Subcontractor"
export type Priority = "Low" | "Medium" | "High" | "Critical"
export type StructureClassification = "Wastewater Line" | "Sludge Line" | "Service Buildings" | "Yard" | "Other"

export interface Activity {
  id: string
  name: string
  type: ActivityType
  progress: number
  notes: string
  obstacles: string
  responsibility: Responsibility
  subcontractor: string
  priority: Priority
  images: string[] // Add this line for storing image URLs/base64
}

export interface Structure {
  id: string
  code: string
  name: string
  description: string
  activities: Activity[]
  priority: Priority
  classification: StructureClassification
}
