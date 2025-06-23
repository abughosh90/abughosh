"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, Upload, Download, Loader2, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { useFirebase } from "../hooks/useFirebase"
import type { Structure } from "../types"

interface FirebaseSyncProps {
  structures: Structure[]
  onStructuresUpdate: (structures: Structure[]) => void
}

export function FirebaseSync({ structures, onStructuresUpdate }: FirebaseSyncProps) {
  const { isLoading, isConnected, saveToFirebase, loadFromFirebase, subscribeToChanges } = useFirebase()

  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Auto-save to Firebase when structures change
  useEffect(() => {
    if (!isConnected || structures.length === 0) return

    const autoSave = async () => {
      try {
        setSyncStatus("syncing")
        setErrorMessage("")
        await saveToFirebase(structures)
        setLastSaved(new Date())
        setSyncStatus("synced")
        setTimeout(() => setSyncStatus("idle"), 3000)
      } catch (error) {
        console.error("Auto-save failed:", error)
        setSyncStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Auto-save failed")
      }
    }

    const timeoutId = setTimeout(autoSave, 3000) // Auto-save after 3 seconds of inactivity
    return () => clearTimeout(timeoutId)
  }, [structures, isConnected, saveToFirebase])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribeToChanges((updatedStructures) => {
      if (updatedStructures && updatedStructures.length > 0) {
        onStructuresUpdate(updatedStructures)
        console.log("Received real-time update from Firebase")
      }
    })

    return unsubscribe
  }, [isConnected, subscribeToChanges, onStructuresUpdate])

  const handleManualSave = async () => {
    if (!isConnected) return

    setIsSaving(true)
    try {
      setErrorMessage("")
      await saveToFirebase(structures)
      setLastSaved(new Date())
      setSyncStatus("synced")
      setTimeout(() => setSyncStatus("idle"), 3000)
    } catch (error) {
      console.error("Manual save failed:", error)
      setSyncStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Manual save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualLoad = async () => {
    if (!isConnected) return

    setIsLoadingData(true)
    try {
      setErrorMessage("")
      const loadedStructures = await loadFromFirebase()
      if (loadedStructures && loadedStructures.length > 0) {
        onStructuresUpdate(loadedStructures)
        setSyncStatus("synced")
        setTimeout(() => setSyncStatus("idle"), 3000)
        console.log("Data loaded from Firebase successfully")
      } else {
        console.log("No data found in Firebase")
      }
    } catch (error) {
      console.error("Manual load failed:", error)
      setSyncStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Manual load failed")
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700">Connecting to Firebase...</span>
      </div>
    )
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="flex flex-wrap items-center gap-3">
        {/* Connection Status */}
        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
          {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isConnected ? "Firebase Connected" : "Firebase Offline"}
        </Badge>

        {/* Sync Status */}
        {isConnected && (
          <Badge
            variant={
              syncStatus === "synced"
                ? "default"
                : syncStatus === "syncing"
                  ? "secondary"
                  : syncStatus === "error"
                    ? "destructive"
                    : "outline"
            }
            className="flex items-center gap-1"
          >
            {syncStatus === "syncing" && <Loader2 className="h-3 w-3 animate-spin" />}
            {syncStatus === "synced" && <Cloud className="h-3 w-3" />}
            {syncStatus === "error" && <AlertCircle className="h-3 w-3" />}
            {syncStatus === "idle" && <Cloud className="h-3 w-3" />}

            {syncStatus === "syncing" && "Syncing..."}
            {syncStatus === "synced" && "Cloud Synced"}
            {syncStatus === "error" && "Sync Error"}
            {syncStatus === "idle" && "Cloud Ready"}
          </Badge>
        )}

        {/* Manual Controls */}
        {isConnected && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || structures.length === 0}
              className="flex items-center gap-1"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Save to Cloud
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualLoad}
              disabled={isLoadingData}
              className="flex items-center gap-1"
            >
              {isLoadingData ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              Load from Cloud
            </Button>
          </>
        )}

        {/* Last Saved Indicator */}
        {lastSaved && (
          <span className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Error: {errorMessage}
          </div>
        </div>
      )}
    </div>
  )
}
