/* app/page.tsx */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Share, Check, Save } from "lucide-react"
import type { Structure, Activity, ActivityType, Responsibility, Priority, StructureClassification } from "../types"
import { PRELOADED_STRUCTURES } from "../data/preloaded-structures"
import { generateId } from "../utils/helpers"
import { ProjectOverview } from "../components/project-overview"
import { StructuresPanel } from "../components/structures-panel"
import { ActivitiesPanel } from "../components/activities-panel"
import { TabularView } from "../components/tabular-view"
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog"
import { FirebaseSync } from "../components/firebase-sync"
import { FirebaseStatus } from "../components/firebase-status"

/* ----------  Types ---------- */
type ViewMode = "dashboard" | "table"

/* ----------  Component ---------- */
export default function WWTPProgressTracker() {
  /* ----- State ----- */
  const [structures, setStructures] = useState<Structure[]>(() =>
    PRELOADED_STRUCTURES.map((s) => ({ ...s, activities: [] })),
  )
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null)

  const [newStructure, setNewStructure] = useState({
    code: "",
    name: "",
    description: "",
    priority: "Medium" as Priority,
    classification: "Other" as StructureClassification,
  })

  const [newActivity, setNewActivity] = useState({
    name: "",
    type: "Civil" as ActivityType,
    progress: 0,
    notes: "",
    obstacles: "",
    responsibility: "HCC" as Responsibility,
    subcontractor: "",
    priority: "Medium" as Priority,
    images: [] as string[],
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [structureToDelete, setStructureToDelete] = useState<string | null>(null)
  const [structureToDeleteName, setStructureToDeleteName] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"structures" | "activities">("structures")
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [showFirebaseStatus, setShowFirebaseStatus] = useState(true)

  /* Sharing */
  const [isSharing, setIsSharing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  /* ----------  Share helpers ---------- */
  const compress = (str: string) => btoa(encodeURIComponent(str))
  const decompress = (str: string) => decodeURIComponent(atob(str))

  const generateShareUrl = () => {
    setIsSharing(true)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("data", compress(JSON.stringify(structures)))
      navigator.clipboard.writeText(url.toString()).then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
    } catch (e) {
      console.error(e)
      alert("Could not generate share link.")
    } finally {
      setIsSharing(false)
    }
  }

  const saveDataPermanently = () => {
    try {
      localStorage.setItem("wwtpProgressData", JSON.stringify(structures))
      localStorage.setItem(
        "wwtpProgressDataBackup",
        JSON.stringify({
          data: structures,
          timestamp: new Date().toISOString(),
          version: "1.0",
        }),
      )
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error("Failed to save data:", error)
      alert("Failed to save data permanently. Please try again.")
    }
  }

  /* ----------  Load data (URL → localStorage fallback) ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("data")

    if (encoded) {
      try {
        const parsed = JSON.parse(decompress(encoded))
        setStructures(parsed)
        parsed.length && setSelectedStructure(parsed[0])
        params.delete("data")
        window.history.replaceState({}, "", `${window.location.pathname}`)
        return
      } catch (e) {
        console.error("URL-data parse error", e)
      }
    }

    const saved = localStorage.getItem("wwtpProgressData")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStructures(parsed)
        parsed.length && setSelectedStructure(parsed[0])
      } catch (e) {
        console.error("localStorage parse error", e)
      }
    } else {
      PRELOADED_STRUCTURES.length && setSelectedStructure({ ...structures[0] })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("wwtpProgressData", JSON.stringify(structures))
  }, [structures])

  /* ----------  Derived values ---------- */
  const filteredStructures = structures.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalStructures = structures.length
  const totalActivities = structures.reduce((sum, s) => sum + s.activities.length, 0)
  const overallProgress =
    totalActivities === 0
      ? 0
      : Math.round(
          structures.reduce((acc, s) => acc + s.activities.reduce((p, a) => p + a.progress, 0), 0) / totalActivities,
        )

  /* ----------  CRUD helpers (unchanged) ---------- */
  const addStructure = () => {
    if (!newStructure.name.trim() || !newStructure.code.trim()) return
    const newS: Structure = { id: generateId(), ...newStructure, activities: [] }
    setStructures((prev) => [...prev, newS])
    setSelectedStructure(newS)
    setNewStructure({ code: "", name: "", description: "", priority: "Medium", classification: "Other" })
  }

  const updateStructure = (id: string, updates: Partial<Structure>) => {
    setStructures((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    if (selectedStructure?.id === id) setSelectedStructure((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const deleteStructure = (id: string) => {
    setStructures((prev) => prev.filter((s) => s.id !== id))
    if (selectedStructure?.id === id) setSelectedStructure(null)
  }

  const addActivity = () => {
    if (!selectedStructure || !newActivity.name.trim()) return
    const newA: Activity = { id: generateId(), ...newActivity }
    setStructures((prev) =>
      prev.map((s) => (s.id === selectedStructure.id ? { ...s, activities: [...s.activities, newA] } : s)),
    )
    setSelectedStructure((prev) => (prev ? { ...prev, activities: [...prev.activities, newA] } : null))
    setNewActivity({
      name: "",
      type: "Civil",
      progress: 0,
      notes: "",
      obstacles: "",
      responsibility: "HCC",
      subcontractor: "",
      priority: "Medium",
      images: [],
    })
  }

  const updateActivityProgress = (sid: string, aid: string, progress: number) => {
    setStructures((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, activities: s.activities.map((a) => (a.id === aid ? { ...a, progress } : a)) } : s,
      ),
    )
    if (selectedStructure?.id === sid) {
      setSelectedStructure((prev) =>
        prev ? { ...prev, activities: prev.activities.map((a) => (a.id === aid ? { ...a, progress } : a)) } : null,
      )
    }
  }

  const deleteActivity = (sid: string, aid: string) => {
    setStructures((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, activities: s.activities.filter((a) => a.id !== aid) } : s)),
    )
    if (selectedStructure?.id === sid) {
      setSelectedStructure((prev) =>
        prev ? { ...prev, activities: prev.activities.filter((a) => a.id !== aid) } : null,
      )
    }
  }

  const updateActivity = (sid: string, aid: string, updates: Partial<Activity>) => {
    setStructures((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, activities: s.activities.map((a) => (a.id === aid ? { ...a, ...updates } : a)) } : s,
      ),
    )
    if (selectedStructure?.id === sid) {
      setSelectedStructure((prev) =>
        prev ? { ...prev, activities: prev.activities.map((a) => (a.id === aid ? { ...a, ...updates } : a)) } : null,
      )
    }
  }

  /* ----------  Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* -------- Header -------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1 className="text-3xl font-bold">WWTP Construction Progress Tracker</h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={saveDataPermanently}
              disabled={structures.length === 0}
              className="flex items-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Data Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={generateShareUrl}
              disabled={isSharing || structures.length === 0}
              className="flex items-center gap-2"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  Generating...
                </>
              ) : copySuccess ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share className="h-4 w-4" />
                  Share Data
                </>
              )}
            </Button>

            <Button variant={viewMode === "dashboard" ? "default" : "outline"} onClick={() => setViewMode("dashboard")}>
              Dashboard
            </Button>
            <Button variant={viewMode === "table" ? "default" : "outline"} onClick={() => setViewMode("table")}>
              Table
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFirebaseStatus(!showFirebaseStatus)}
              className="flex items-center gap-2"
            >
              🔥 Firebase Status
            </Button>
          </div>
        </div>

        {/* Firebase Status Panel */}
        {showFirebaseStatus && <FirebaseStatus />}

        {/* Firebase Sync Component */}
        <div className="mb-4">
          <FirebaseSync structures={structures} onStructuresUpdate={setStructures} />
        </div>

        {/* -------- Views -------- */}
        {viewMode === "dashboard" ? (
          <>
            <ProjectOverview
              totalStructures={totalStructures}
              totalActivities={totalActivities}
              overallProgress={overallProgress}
              structures={structures}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <StructuresPanel
                  structures={filteredStructures}
                  selectedStructure={selectedStructure}
                  newStructure={newStructure}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  onSelectStructure={setSelectedStructure}
                  onAddStructure={addStructure}
                  onUpdateNewStructure={setNewStructure}
                  onUpdateStructure={updateStructure}
                  onDeleteStructure={(id) => {
                    const s = structures.find((st) => st.id === id)
                    setStructureToDelete(id)
                    setStructureToDeleteName(s?.name || "")
                    setShowDeleteDialog(true)
                  }}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>

              {selectedStructure && (
                <div className="lg:col-span-2">
                  <ActivitiesPanel
                    structure={selectedStructure}
                    newActivity={newActivity}
                    onUpdateNewActivity={setNewActivity}
                    onAddActivity={addActivity}
                    onUpdateProgress={updateActivityProgress}
                    onDeleteActivity={deleteActivity}
                    onUpdateActivity={updateActivity}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <TabularView structures={structures} />
        )}

        {/* -------- Delete dialog -------- */}
        {showDeleteDialog && (
          <DeleteConfirmationDialog
            type="structure"
            itemName={structureToDeleteName}
            onCancel={() => setShowDeleteDialog(false)}
            onConfirm={() => {
              structureToDelete && deleteStructure(structureToDelete)
              setShowDeleteDialog(false)
              setStructureToDelete(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
