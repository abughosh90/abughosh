interface GoogleAppsScriptResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
  spreadsheetUrl?: string
  documentUrl?: string
  rowCount?: number
}

export class GoogleAppsScriptService {
  private scriptUrl: string

  constructor() {
    this.scriptUrl =
      "https://script.google.com/macros/s/AKfycbzmrV3FdARLNFxZ628mVXWOkVygeuR4c55IvP4DXq_DGA0tP__Ts0NJB1cf6oxwatw/exec"
  }

  // Send data to Google Apps Script
  async sendData(data: any, action = "saveData"): Promise<GoogleAppsScriptResponse> {
    try {
      const response = await fetch(this.scriptUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action,
          data: data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          version: "2.0",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Google Apps Script error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Get data from Google Apps Script
  async getData(action = "getData", params?: Record<string, string>): Promise<GoogleAppsScriptResponse> {
    try {
      const url = new URL(this.scriptUrl)
      url.searchParams.set("action", action)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Google Apps Script error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Save structures data to Google Sheets
  async saveStructures(structures: any[]): Promise<GoogleAppsScriptResponse> {
    return this.sendData(structures, "saveStructures")
  }

  // Get structures data from Google Sheets
  async loadStructures(): Promise<GoogleAppsScriptResponse> {
    return this.getData("loadStructures")
  }

  // Create backup of current data
  async createBackup(structures: any[], backupName?: string): Promise<GoogleAppsScriptResponse> {
    return this.sendData(
      {
        structures,
        backupName: backupName || `Backup ${new Date().toLocaleString()}`,
      },
      "createBackup",
    )
  }

  // List available backups
  async listBackups(): Promise<GoogleAppsScriptResponse> {
    return this.getData("listBackups")
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<GoogleAppsScriptResponse> {
    return this.getData("restoreBackup", { backupId })
  }

  // Generate comprehensive progress report
  async generateProgressReport(structures: any[]): Promise<GoogleAppsScriptResponse> {
    const reportData = {
      structures: structures,
      generatedAt: new Date().toISOString(),
      totalStructures: structures.length,
      totalActivities: structures.reduce((sum, s) => sum + s.activities.length, 0),
      overallProgress:
        structures.reduce((acc, s) => {
          const structureProgress = s.activities.reduce((p, a) => p + a.progress, 0) / (s.activities.length || 1)
          return acc + structureProgress
        }, 0) / (structures.length || 1),
      statistics: this.calculateStatistics(structures),
    }

    return this.sendData(reportData, "generateProgressReport")
  }

  // Generate activity summary report
  async generateActivityReport(structures: any[]): Promise<GoogleAppsScriptResponse> {
    const activities = structures.flatMap((s) =>
      s.activities.map((a) => ({
        ...a,
        structureCode: s.code,
        structureName: s.name,
        structureClassification: s.classification,
      })),
    )

    return this.sendData(
      {
        activities,
        generatedAt: new Date().toISOString(),
        summary: this.calculateActivitySummary(activities),
      },
      "generateActivityReport",
    )
  }

  // Export data to CSV format
  async exportToCSV(structures: any[]): Promise<GoogleAppsScriptResponse> {
    return this.sendData(structures, "exportToCSV")
  }

  // Sync images (convert base64 to Google Drive files)
  async syncImages(structures: any[]): Promise<GoogleAppsScriptResponse> {
    const imagesData = structures.flatMap((s) =>
      s.activities
        .filter((a) => a.images && a.images.length > 0)
        .map((a) => ({
          structureCode: s.code,
          activityId: a.id,
          activityName: a.name,
          images: a.images,
        })),
    )

    return this.sendData(imagesData, "syncImages")
  }

  // Test connection to Google Apps Script
  async testConnection(): Promise<GoogleAppsScriptResponse> {
    return this.getData("ping")
  }

  // Get system status and information
  async getSystemInfo(): Promise<GoogleAppsScriptResponse> {
    return this.getData("getSystemInfo")
  }

  // Calculate project statistics
  private calculateStatistics(structures: any[]) {
    const activities = structures.flatMap((s) => s.activities)

    return {
      byResponsibility: this.groupBy(activities, "responsibility"),
      byType: this.groupBy(activities, "type"),
      byPriority: this.groupBy(activities, "priority"),
      byClassification: this.groupBy(structures, "classification"),
      progressDistribution: {
        notStarted: activities.filter((a) => a.progress === 0).length,
        inProgress: activities.filter((a) => a.progress > 0 && a.progress < 100).length,
        completed: activities.filter((a) => a.progress === 100).length,
      },
      withObstacles: activities.filter((a) => a.obstacles && a.obstacles.trim()).length,
      withImages: activities.filter((a) => a.images && a.images.length > 0).length,
    }
  }

  // Calculate activity summary
  private calculateActivitySummary(activities: any[]) {
    return {
      total: activities.length,
      averageProgress: activities.reduce((sum, a) => sum + a.progress, 0) / activities.length,
      byStatus: {
        notStarted: activities.filter((a) => a.progress === 0).length,
        inProgress: activities.filter((a) => a.progress > 0 && a.progress < 100).length,
        completed: activities.filter((a) => a.progress === 100).length,
      },
    }
  }

  // Helper function to group array by property
  private groupBy(array: any[], property: string) {
    return array.reduce((acc, item) => {
      const key = item[property]
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }
}
