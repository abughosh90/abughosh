"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ImageIcon, Edit, Save, X, Upload, ChevronUp, ChevronDown } from "lucide-react"
import type { Activity, ActivityType, Responsibility, Priority } from "../types"
import { getPriorityColor } from "../utils/helpers"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface ActivityCardProps {
  activity: Activity
  structureId: string
  onUpdateProgress: (structureId: string, activityId: string, progress: number) => void
  onDeleteActivity: (structureId: string, activityId: string) => void
  onUpdateActivity: (structureId: string, activityId: string, updates: Partial<Activity>) => void
}

export function ActivityCard({
  activity,
  structureId,
  onUpdateProgress,
  onDeleteActivity,
  onUpdateActivity,
}: ActivityCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: activity.name,
    type: activity.type,
    progress: activity.progress,
    notes: activity.notes,
    obstacles: activity.obstacles,
    responsibility: activity.responsibility,
    subcontractor: activity.subcontractor,
    priority: activity.priority,
    images: activity.images || [],
  })

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onDeleteActivity(structureId, activity.id)
    setShowDeleteDialog(false)
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditForm({
      name: activity.name,
      type: activity.type,
      progress: activity.progress,
      notes: activity.notes,
      obstacles: activity.obstacles,
      responsibility: activity.responsibility,
      subcontractor: activity.subcontractor,
      priority: activity.priority,
      images: activity.images || [],
    })
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({
      name: activity.name,
      type: activity.type,
      progress: activity.progress,
      notes: activity.notes,
      obstacles: activity.obstacles,
      responsibility: activity.responsibility,
      subcontractor: activity.subcontractor,
      priority: activity.priority,
      images: activity.images || [],
    })
  }

  const saveEditing = () => {
    if (editForm.name.trim()) {
      onUpdateActivity(structureId, activity.id, editForm)
      setIsEditing(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setEditForm((prev) => ({
            ...prev,
            images: [...prev.images, result],
          }))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activity Name*</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Activity name"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value: ActivityType) => setEditForm({ ...editForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                value={editForm.responsibility}
                onValueChange={(value: Responsibility) => setEditForm({ ...editForm, responsibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                value={editForm.priority}
                onValueChange={(value: Priority) => setEditForm({ ...editForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                  value={editForm.progress}
                  onChange={(e) => setEditForm({ ...editForm, progress: Number(e.target.value) })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditForm({ ...editForm, progress: Math.min(100, editForm.progress + 10) })}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditForm({ ...editForm, progress: Math.max(0, editForm.progress - 10) })}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subcontractor</Label>
              <Input
                value={editForm.subcontractor}
                onChange={(e) => setEditForm({ ...editForm, subcontractor: e.target.value })}
                placeholder="Subcontractor name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attach Images</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id={`image-upload-${activity.id}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`image-upload-${activity.id}`)?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
              <span className="text-sm text-muted-foreground">{editForm.images.length} image(s)</span>
            </div>

            {editForm.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {editForm.images.map((image, index) => (
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
              value={editForm.obstacles}
              onChange={(e) => setEditForm({ ...editForm, obstacles: e.target.value })}
              placeholder="Current obstacles or challenges"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveEditing} disabled={!editForm.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={cancelEditing}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{activity.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(activity.priority)}`}>
                {activity.priority}
              </span>
              {activity.images && activity.images.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {activity.images.length}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="mr-2">Type: {activity.type}</span>
              <span className="mr-2">| Responsibility: {activity.responsibility}</span>
              {activity.subcontractor && <span>| Subcontractor: {activity.subcontractor}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateProgress(structureId, activity.id, Math.min(100, activity.progress + 10))}
            >
              +10%
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700" onClick={startEditing}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Progress value={activity.progress} className="h-2 flex-1" />
          <span className="text-sm font-medium w-12 text-right">{activity.progress}%</span>
        </div>

        {/* Display attached images */}
        {activity.images && activity.images.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Attached Images:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activity.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Activity image ${index + 1}`}
                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => {
                      window.open(image, "_blank")
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activity.obstacles && (
          <div className="mt-2">
            <p className="text-sm">
              <span className="font-medium">Obstacles:</span> {activity.obstacles}
            </p>
          </div>
        )}

        {activity.notes && (
          <div className="mt-1">
            <p className="text-sm">
              <span className="font-medium">Notes:</span> {activity.notes}
            </p>
          </div>
        )}
      </div>

      {showDeleteDialog && (
        <DeleteConfirmationDialog
          type="activity"
          itemName={activity.name}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}
