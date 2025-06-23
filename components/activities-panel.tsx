"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ChevronUp, ChevronDown, Upload, X } from "lucide-react"
import type { Structure, Activity, ActivityType, Responsibility, Priority } from "../types"
import { ActivityCard } from "./activity-card"

interface ActivitiesPanelProps {
  structure: Structure
  newActivity: Omit<Activity, "id">
  onUpdateNewActivity: (activity: Omit<Activity, "id">) => void
  onAddActivity: () => void
  onUpdateProgress: (structureId: string, activityId: string, progress: number) => void
  onDeleteActivity: (structureId: string, activityId: string) => void
  onUpdateActivity: (structureId: string, activityId: string, updates: Partial<Activity>) => void
  activeTab: string
  setActiveTab: (tab: "structures" | "activities") => void
}

export function ActivitiesPanel({
  structure,
  newActivity,
  onUpdateNewActivity,
  onAddActivity,
  onUpdateProgress,
  onDeleteActivity,
  onUpdateActivity,
  activeTab,
  setActiveTab,
}: ActivitiesPanelProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setSelectedImages((prev) => [...prev, result])
          onUpdateNewActivity({ ...newActivity, images: [...(newActivity.images || []), result] })
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(updatedImages)
    onUpdateNewActivity({ ...newActivity, images: updatedImages })
  }

  const handleAddActivity = () => {
    onAddActivity()
    setSelectedImages([]) // Clear selected images after adding activity
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {structure.code} - {structure.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{structure.description}</p>
          </div>
          <div className="flex space-x-2 lg:hidden">
            <Button
              variant={activeTab === "structures" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("structures")}
            >
              Structures
            </Button>
            <Button
              variant={activeTab === "activities" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("activities")}
            >
              Activities
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`${activeTab === "structures" ? "hidden lg:block" : ""}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Activity Name*</Label>
              <Input
                value={newActivity.name}
                onChange={(e) => onUpdateNewActivity({ ...newActivity, name: e.target.value })}
                placeholder="Activity name"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newActivity.type}
                onValueChange={(value: ActivityType) => onUpdateNewActivity({ ...newActivity, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Structural">Structural</SelectItem>
                  <SelectItem value="Piping">Piping</SelectItem>
                  <SelectItem value="Instrumentation">Instrumentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsibility</Label>
              <Select
                value={newActivity.responsibility}
                onValueChange={(value: Responsibility) =>
                  onUpdateNewActivity({ ...newActivity, responsibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HCC">HCC</SelectItem>
                  <SelectItem value="ALKE">ALKE</SelectItem>
                  <SelectItem value="PWA">PWA</SelectItem>
                  <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={newActivity.priority}
                onValueChange={(value: Priority) => onUpdateNewActivity({ ...newActivity, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Progress (%)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newActivity.progress}
                  onChange={(e) => onUpdateNewActivity({ ...newActivity, progress: Number(e.target.value) })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateNewActivity({ ...newActivity, progress: Math.min(100, newActivity.progress + 10) })
                  }
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateNewActivity({ ...newActivity, progress: Math.max(0, newActivity.progress - 10) })
                  }
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subcontractor</Label>
              <Input
                value={newActivity.subcontractor}
                onChange={(e) => onUpdateNewActivity({ ...newActivity, subcontractor: e.target.value })}
                placeholder="Subcontractor name"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Attach Images</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
              <span className="text-sm text-muted-foreground">{selectedImages.length} image(s) selected</span>
            </div>

            {/* Preview selected images */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Obstacles</Label>
            <Textarea
              value={newActivity.obstacles}
              onChange={(e) => onUpdateNewActivity({ ...newActivity, obstacles: e.target.value })}
              placeholder="Current obstacles or challenges"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={newActivity.notes}
              onChange={(e) => onUpdateNewActivity({ ...newActivity, notes: e.target.value })}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <Button onClick={handleAddActivity} className="w-full" disabled={!newActivity.name.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Add Activity
          </Button>

          {/* Activity List */}
          <div className="border rounded-lg divide-y mt-6">
            {structure.activities.length > 0 ? (
              structure.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  structureId={structure.id}
                  onUpdateProgress={onUpdateProgress}
                  onDeleteActivity={onDeleteActivity}
                  onUpdateActivity={onUpdateActivity}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No activities yet. Add your first activity above.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
