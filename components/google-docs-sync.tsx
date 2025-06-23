"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Archive,
  BarChart3,
  ImageIcon,
  FileDown,
  Clock,
  Database,
} from "lucide-react"
import { GoogleAppsScriptService } from "../lib/google-apps-script"
import type { Structure } from "../types"

interface GoogleDocsSyncProps {
  structures: Structure[]
  onStructuresUpdate: (structures: Structure[]) => void
}

export function GoogleDocsSync({ structures, onStructuresUpdate }: GoogleDocsSyncProps) {
  const [gasService] = useState(() => new GoogleAppsScriptService())
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isGeneratingActivityReport, setIsGeneratingActivityReport] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isSyncingImages, setIsSyncingImages] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || structures.length === 0 || connectionStatus !== "connected") return

    const autoSave = async () => {
      try {
        await gasService.saveStructures(structures)
        setLastSync(new Date())
        console.log("Auto-saved to Google Docs")
      } catch (error) {
        console.error("Auto-save failed:", error)
      }
    }

    const timeoutId = setTimeout(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearTimeout(timeoutId)
  }, [structures, autoSaveEnabled, connectionStatus, gasService])

  // Load system info on connection
  useEffect(() => {
    if (connectionStatus === "connected") {
      loadSystemInfo()
    }
  }, [connectionStatus])

  const loadSystemInfo = async () => {
    try {
      const result = await gasService.getSystemInfo()
      if (result.success) {
        setSystemInfo(result.data)
      }
    } catch (error) {
      console.error("Failed to load system info:", error)
    }
  }

  const testConnection = async () => {
    setIsConnecting(true)
    setStatusMessage("")

    try {
      const result = await gasService.testConnection()
      if (result.success) {
        setConnectionStatus("connected")
        setStatusMessage("Successfully connected to Google Apps Script")
      } else {
        setConnectionStatus("error")
        setStatusMessage(result.error || "Connection failed")
      }
    } catch (error) {
      setConnectionStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Connection test failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const saveToGoogleDocs = async () => {
    setIsSaving(true)
    setStatusMessage("")

    try {
      const result = await gasService.saveStructures(structures)
      if (result.success) {
        setLastSync(new Date())
        setStatusMessage(
          `Data successfully saved to Google Sheets${result.rowCount ? ` (${result.rowCount} rows)` : ""}`,
        )
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to save data")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Save operation failed")
      setConnectionStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  const loadFromGoogleDocs = async () => {
    setIsLoading(true)
    setStatusMessage("")

    try {
      const result = await gasService.loadStructures()
      if (result.success && result.data) {
        onStructuresUpdate(result.data)
        setLastSync(new Date())
        setStatusMessage(`Data successfully loaded from Google Sheets (${result.data.length} structures)`)
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "No data found or failed to load")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Load operation failed")
      setConnectionStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const generateProgressReport = async () => {
    setIsGeneratingReport(true)
    setStatusMessage("")

    try {
      const result = await gasService.generateProgressReport(structures)
      if (result.success) {
        setStatusMessage("Comprehensive progress report generated successfully in Google Docs")
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to generate progress report")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Progress report generation failed")
      setConnectionStatus("error")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const generateActivityReport = async () => {
    setIsGeneratingActivityReport(true)
    setStatusMessage("")

    try {
      const result = await gasService.generateActivityReport(structures)
      if (result.success) {
        setStatusMessage("Activity summary report generated successfully in Google Docs")
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to generate activity report")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Activity report generation failed")
      setConnectionStatus("error")
    } finally {
      setIsGeneratingActivityReport(false)
    }
  }

  const createBackup = async () => {
    setIsCreatingBackup(true)
    setStatusMessage("")

    try {
      const result = await gasService.createBackup(structures)
      if (result.success) {
        setStatusMessage("Backup created successfully in Google Drive")
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to create backup")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Backup creation failed")
      setConnectionStatus("error")
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const syncImages = async () => {
    setIsSyncingImages(true)
    setStatusMessage("")

    try {
      const result = await gasService.syncImages(structures)
      if (result.success) {
        setStatusMessage("Images synchronized successfully to Google Drive")
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to sync images")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Image sync failed")
      setConnectionStatus("error")
    } finally {
      setIsSyncingImages(false)
    }
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    setStatusMessage("")

    try {
      const result = await gasService.exportToCSV(structures)
      if (result.success) {
        setStatusMessage("Data exported to CSV successfully")
        setConnectionStatus("connected")
      } else {
        setStatusMessage(result.error || "Failed to export CSV")
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "CSV export failed")
      setConnectionStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const totalActivities = structures.reduce((sum, s) => sum + s.activities.length, 0)
  const activitiesWithImages = structures.reduce(
    (sum, s) => sum + s.activities.filter((a) => a.images && a.images.length > 0).length,
    0,
  )
  const overallProgress =
    totalActivities === 0
      ? 0
      : Math.round(
          structures.reduce((acc, s) => acc + s.activities.reduce((p, a) => p + a.progress, 0), 0) / totalActivities,
        )

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Google Docs Cloud Storage</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
            {autoSaveEnabled && connectionStatus === "connected" && (
              <Badge variant="outline" className="text-blue-600">
                Auto-Save ON
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Google Apps Script Integration</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  "https://script.google.com/macros/s/AKfycby2iORBrwP8FcqYUUGoJL2WY_CPnWIAkdhsz0chQs8vjtGwSSOJqXYURkXqFghXaCY/exec",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs space-y-1">
            <div>
              <strong>Deployment ID:</strong>
            </div>
            <code className="bg-white p-2 rounded block break-all">
              AKfycby2iORBrwP8FcqYUUGoJL2WY_CPnWIAkdhsz0chQs8vjtGwSSOJqXYURkXqFghXaCY
            </code>
            <div>
              <strong>Web App URL:</strong>
            </div>
            <code className="bg-white p-2 rounded block break-all">
              https://script.google.com/macros/s/AKfycby2iORBrwP8FcqYUUGoJL2WY_CPnWIAkdhsz0chQs8vjtGwSSOJqXYURkXqFghXaCY/exec
            </code>
          </div>
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">System Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <div className="font-mono">{new Date(systemInfo.lastUpdated).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Records:</span>
                <div className="font-mono">{systemInfo.totalRecords || 0}</div>
              </div>
              <div>
                <span className="text-gray-600">Backups:</span>
                <div className="font-mono">{systemInfo.backupCount || 0}</div>
              </div>
              <div>
                <span className="text-gray-600">Storage Used:</span>
                <div className="font-mono">{systemInfo.storageUsed || "N/A"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Save Toggle */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <span className="font-medium">Auto-Save</span>
            <p className="text-sm text-muted-foreground">Automatically save changes every 30 seconds</p>
          </div>
          <Button
            variant={autoSaveEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            disabled={connectionStatus !== "connected"}
          >
            {autoSaveEnabled ? "Enabled" : "Disabled"}
          </Button>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Test Connection
          </Button>

          <Button
            variant="default"
            onClick={saveToGoogleDocs}
            disabled={isSaving || structures.length === 0}
            className="flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Save to Cloud
          </Button>

          <Button
            variant="outline"
            onClick={loadFromGoogleDocs}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Load from Cloud
          </Button>
        </div>

        {/* Advanced Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={generateProgressReport}
            disabled={isGeneratingReport || structures.length === 0}
            className="flex items-center gap-2"
          >
            {isGeneratingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Progress Report
          </Button>

          <Button
            variant="outline"
            onClick={generateActivityReport}
            disabled={isGeneratingActivityReport || structures.length === 0}
            className="flex items-center gap-2"
          >
            {isGeneratingActivityReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            Activity Report
          </Button>

          <Button
            variant="outline"
            onClick={createBackup}
            disabled={isCreatingBackup || structures.length === 0}
            className="flex items-center gap-2"
          >
            {isCreatingBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Create Backup
          </Button>

          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting || structures.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>

        {/* Image Sync */}
        {activitiesWithImages > 0 && (
          <Button
            variant="outline"
            onClick={syncImages}
            disabled={isSyncingImages}
            className="w-full flex items-center gap-2"
          >
            {isSyncingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            Sync {activitiesWithImages} Images to Google Drive
          </Button>
        )}

        {/* Last Sync Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {lastSync ? `Last sync: ${lastSync.toLocaleString()}` : "Never synced"}
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {structures.length} structures, {totalActivities} activities
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <Alert className={connectionStatus === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertDescription className={connectionStatus === "error" ? "text-red-700" : "text-green-700"}>
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Instructions */}
        {connectionStatus === "unknown" && (
          <Alert>
            <AlertDescription>
              <strong>Setup Required:</strong> Make sure your Google Apps Script is deployed and accessible. Click "Test
              Connection" to verify the integration is working.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
