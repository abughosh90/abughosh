"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, Save, X, ChevronDown, ChevronRight } from "lucide-react"
import type { Structure, Priority, StructureClassification } from "../types"
import { getPriorityColor } from "../utils/helpers"

interface StructuresPanelProps {
  structures: Structure[]
  selectedStructure: Structure | null
  newStructure: {
    code: string
    name: string
    description: string
    priority: Priority
    classification: StructureClassification
  }
  searchTerm: string
  onSearch: (term: string) => void
  onSelectStructure: (structure: Structure) => void
  onAddStructure: () => void
  onUpdateNewStructure: (data: {
    code: string
    name: string
    description: string
    priority: Priority
    classification: StructureClassification
  }) => void
  onDeleteStructure: (id: string) => void
  onUpdateStructure: (id: string, updates: Partial<Structure>) => void
  activeTab: string
  setActiveTab: (tab: "structures" | "activities") => void
}

export function StructuresPanel({
  structures,
  selectedStructure,
  newStructure,
  searchTerm,
  onSearch,
  onSelectStructure,
  onAddStructure,
  onUpdateNewStructure,
  onDeleteStructure,
  onUpdateStructure,
  activeTab,
  setActiveTab,
}: StructuresPanelProps) {
  const [editingStructure, setEditingStructure] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    description: "",
    priority: "Medium" as Priority,
    classification: "Other" as StructureClassification,
  })

  const [isStructuresCollapsed, setIsStructuresCollapsed] = useState(false)
  const [isInputFieldsCollapsed, setIsInputFieldsCollapsed] = useState(false)

  const startEditing = (structure: Structure) => {
    setEditingStructure(structure.id)
    setEditForm({
      code: structure.code,
      name: structure.name,
      description: structure.description,
      priority: structure.priority,
      classification: structure.classification,
    })
  }

  const cancelEditing = () => {
    setEditingStructure(null)
    setEditForm({ code: "", name: "", description: "", priority: "Medium", classification: "Other" })
  }

  const saveEditing = () => {
    if (editingStructure && editForm.name.trim() && editForm.code.trim()) {
      onUpdateStructure(editingStructure, editForm)
      setEditingStructure(null)
      setEditForm({ code: "", name: "", description: "", priority: "Medium", classification: "Other" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Structures</CardTitle>
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
      <CardContent className={`${activeTab === "activities" ? "hidden lg:block" : ""}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-structures">Search Structures</Label>
            <Input
              id="search-structures"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name or code..."
            />
          </div>

          {/* Structures List - Now Above Input Fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Structures List ({structures.length})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStructuresCollapsed(!isStructuresCollapsed)}
                className="p-1 h-6 w-6"
              >
                {isStructuresCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {!isStructuresCollapsed && (
              <div className="border rounded-lg divide-y max-h-[600px] overflow-y-auto">
                {structures.length > 0 ? (
                  structures.map((structure) => (
                    <div
                      key={structure.id}
                      className={`p-3 ${editingStructure === structure.id ? "" : "cursor-pointer hover:bg-gray-50"} ${
                        selectedStructure?.id === structure.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (editingStructure !== structure.id) {
                          onSelectStructure(structure)
                        }
                      }}
                    >
                      {editingStructure === structure.id ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editForm.code}
                              onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                              placeholder="Code"
                              className="text-sm"
                            />
                            <Select
                              value={editForm.priority}
                              onValueChange={(value: Priority) => setEditForm({ ...editForm, priority: value })}
                            >
                              <SelectTrigger className="text-sm">
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
                          <Select
                            value={editForm.classification}
                            onValueChange={(value: StructureClassification) =>
                              setEditForm({ ...editForm, classification: value })
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wastewater Line">Wastewater Line</SelectItem>
                              <SelectItem value="Sludge Line">Sludge Line</SelectItem>
                              <SelectItem value="Service Buildings">Service Buildings</SelectItem>
                              <SelectItem value="Yard">Yard</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Name"
                            className="text-sm"
                          />
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEditing}
                              disabled={!editForm.name.trim() || !editForm.code.trim()}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{structure.code}</span>
                              <span className="text-sm px-2 py-0.5 rounded-full bg-gray-100">
                                {structure.activities.length} activities
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(structure.priority)}`}
                              >
                                {structure.priority}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                {structure.classification}
                              </span>
                            </div>
                            <h3 className="font-medium">{structure.name}</h3>
                            <p className="text-sm text-muted-foreground">{structure.description}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(structure)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteStructure(structure.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No structures found. {searchTerm ? "Try a different search." : "Add your first structure below."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add New Structure Section - Now Below Structure List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Add New Structure</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInputFieldsCollapsed(!isInputFieldsCollapsed)}
                className="p-1 h-6 w-6"
              >
                {isInputFieldsCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {!isInputFieldsCollapsed && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="structure-code" className="text-xs">
                      Code*
                    </Label>
                    <Input
                      id="structure-code"
                      value={newStructure.code}
                      onChange={(e) => onUpdateNewStructure({ ...newStructure, code: e.target.value })}
                      placeholder="Code"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="structure-priority" className="text-xs">
                      Priority
                    </Label>
                    <Select
                      value={newStructure.priority}
                      onValueChange={(value: Priority) => onUpdateNewStructure({ ...newStructure, priority: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="structure-classification" className="text-xs">
                      Classification
                    </Label>
                    <Select
                      value={newStructure.classification}
                      onValueChange={(value: StructureClassification) =>
                        onUpdateNewStructure({ ...newStructure, classification: value })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wastewater Line">Wastewater Line</SelectItem>
                        <SelectItem value="Sludge Line">Sludge Line</SelectItem>
                        <SelectItem value="Service Buildings">Service Buildings</SelectItem>
                        <SelectItem value="Yard">Yard</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="structure-name" className="text-xs">
                    Name*
                  </Label>
                  <Input
                    id="structure-name"
                    value={newStructure.name}
                    onChange={(e) => onUpdateNewStructure({ ...newStructure, name: e.target.value })}
                    placeholder="Structure name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="structure-desc" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="structure-desc"
                    value={newStructure.description}
                    onChange={(e) => onUpdateNewStructure({ ...newStructure, description: e.target.value })}
                    placeholder="Structure description"
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
                <Button
                  onClick={onAddStructure}
                  className="w-full h-8 text-sm"
                  disabled={!newStructure.name.trim() || !newStructure.code.trim()}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Structure
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
