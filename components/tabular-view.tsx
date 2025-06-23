"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, Download, ArrowUpDown, ImageIcon } from "lucide-react"
import type { Structure, Priority, Responsibility, ActivityType, StructureClassification } from "../types"
import { getPriorityColor } from "../utils/helpers"

interface TabularViewProps {
  structures: Structure[]
}

interface FlattenedData {
  structureId: string
  structureCode: string
  structureName: string
  structureDescription: string
  structurePriority: Priority
  structureClassification: StructureClassification
  activityId?: string
  activityName?: string
  activityType?: ActivityType
  activityProgress?: number
  activityNotes?: string
  activityObstacles?: string
  activityResponsibility?: Responsibility
  activitySubcontractor?: string
  activityPriority?: Priority
  activityImageCount?: number
  isStructureOnly: boolean
}

type SortField = keyof FlattenedData
type SortDirection = "asc" | "desc"

export function TabularView({ structures }: TabularViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterResponsibility, setFilterResponsibility] = useState<string>("all")
  const [filterActivityType, setFilterActivityType] = useState<string>("all")
  const [filterProgressMin, setFilterProgressMin] = useState<string>("")
  const [filterProgressMax, setFilterProgressMax] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>("structureCode")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterClassification, setFilterClassification] = useState<string>("all")

  // Flatten data for table display
  const flattenedData = useMemo(() => {
    const flattened: FlattenedData[] = []

    structures.forEach((structure) => {
      if (structure.activities.length === 0) {
        // Structure with no activities
        flattened.push({
          structureId: structure.id,
          structureCode: structure.code,
          structureName: structure.name,
          structureDescription: structure.description,
          structurePriority: structure.priority,
          structureClassification: structure.classification,
          isStructureOnly: true,
        })
      } else {
        // Structure with activities
        structure.activities.forEach((activity) => {
          flattened.push({
            structureId: structure.id,
            structureCode: structure.code,
            structureName: structure.name,
            structureDescription: structure.description,
            structurePriority: structure.priority,
            structureClassification: structure.classification,
            activityId: activity.id,
            activityName: activity.name,
            activityType: activity.type,
            activityProgress: activity.progress,
            activityNotes: activity.notes,
            activityObstacles: activity.obstacles,
            activityResponsibility: activity.responsibility,
            activitySubcontractor: activity.subcontractor,
            activityPriority: activity.priority,
            activityImageCount: activity.images?.length || 0,
            isStructureOnly: false,
          })
        })
      }
    })

    return flattened
  }, [structures])

  // Apply filters and search
  const filteredData = useMemo(() => {
    let filtered = flattenedData

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.structureCode.toLowerCase().includes(term) ||
          item.structureName.toLowerCase().includes(term) ||
          item.structureDescription.toLowerCase().includes(term) ||
          item.activityName?.toLowerCase().includes(term) ||
          item.activityNotes?.toLowerCase().includes(term) ||
          item.activityObstacles?.toLowerCase().includes(term) ||
          item.activitySubcontractor?.toLowerCase().includes(term),
      )
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(
        (item) => item.structurePriority === filterPriority || item.activityPriority === filterPriority,
      )
    }

    // Responsibility filter
    if (filterResponsibility !== "all") {
      filtered = filtered.filter((item) => item.activityResponsibility === filterResponsibility)
    }

    // Activity type filter
    if (filterActivityType !== "all") {
      filtered = filtered.filter((item) => item.activityType === filterActivityType)
    }

    // Progress range filter
    if (filterProgressMin !== "" || filterProgressMax !== "") {
      const min = filterProgressMin ? Number(filterProgressMin) : 0
      const max = filterProgressMax ? Number(filterProgressMax) : 100
      filtered = filtered.filter((item) => {
        if (item.isStructureOnly) return true
        const progress = item.activityProgress || 0
        return progress >= min && progress <= max
      })
    }

    // Add classification filter logic:
    if (filterClassification !== "all") {
      filtered = filtered.filter((item) => item.structureClassification === filterClassification)
    }

    return filtered
  }, [
    flattenedData,
    searchTerm,
    filterPriority,
    filterResponsibility,
    filterActivityType,
    filterProgressMin,
    filterProgressMax,
    filterClassification,
  ])

  // Apply sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
      if (bValue === undefined) return sortDirection === "asc" ? -1 : 1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [filteredData, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterPriority("all")
    setFilterResponsibility("all")
    setFilterActivityType("all")
    setFilterClassification("all")
    setFilterProgressMin("")
    setFilterProgressMax("")
  }

  const exportToCSV = () => {
    const headers = [
      "Structure Code",
      "Structure Name",
      "Structure Description",
      "Structure Priority",
      "Structure Classification",
      "Activity Name",
      "Activity Type",
      "Activity Progress",
      "Activity Responsibility",
      "Activity Subcontractor",
      "Activity Priority",
      "Activity Notes",
      "Activity Obstacles",
      "Image Count",
    ]

    const csvData = sortedData.map((item) => [
      item.structureCode,
      item.structureName,
      item.structureDescription,
      item.structurePriority,
      item.structureClassification,
      item.activityName || "",
      item.activityType || "",
      item.activityProgress?.toString() || "",
      item.activityResponsibility || "",
      item.activitySubcontractor || "",
      item.activityPriority || "",
      item.activityNotes || "",
      item.activityObstacles || "",
      item.activityImageCount?.toString() || "0",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "wwtp-progress-data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Data Table View</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              {(searchTerm ||
                filterPriority !== "all" ||
                filterResponsibility !== "all" ||
                filterActivityType !== "all" ||
                filterProgressMin ||
                filterProgressMax ||
                filterClassification !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Responsibility</Label>
                  <Select value={filterResponsibility} onValueChange={setFilterResponsibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Responsibilities</SelectItem>
                      <SelectItem value="HCC">HCC</SelectItem>
                      <SelectItem value="ALKE">ALKE</SelectItem>
                      <SelectItem value="PWA">PWA</SelectItem>
                      <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Select value={filterActivityType} onValueChange={setFilterActivityType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
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
                  <Label>Progress Min (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={filterProgressMin}
                    onChange={(e) => setFilterProgressMin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Progress Max (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={filterProgressMax}
                    onChange={(e) => setFilterProgressMax(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Select value={filterClassification} onValueChange={setFilterClassification}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classifications</SelectItem>
                      <SelectItem value="Wastewater Line">Wastewater Line</SelectItem>
                      <SelectItem value="Sludge Line">Sludge Line</SelectItem>
                      <SelectItem value="Service Buildings">Service Buildings</SelectItem>
                      <SelectItem value="Yard">Yard</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Showing {sortedData.length} of {flattenedData.length} records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("structureCode")}
                      className="h-auto p-0 font-medium"
                    >
                      Structure Code
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("structureName")}
                      className="h-auto p-0 font-medium"
                    >
                      Structure Name
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("structurePriority")}
                      className="h-auto p-0 font-medium"
                    >
                      Structure Priority
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("structureClassification")}
                      className="h-auto p-0 font-medium"
                    >
                      Classification
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("activityName")}
                      className="h-auto p-0 font-medium"
                    >
                      Activity Name
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("activityType")}
                      className="h-auto p-0 font-medium"
                    >
                      Type
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("activityProgress")}
                      className="h-auto p-0 font-medium"
                    >
                      Progress
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("activityResponsibility")}
                      className="h-auto p-0 font-medium"
                    >
                      Responsibility
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("activityPriority")}
                      className="h-auto p-0 font-medium"
                    >
                      Activity Priority
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">Subcontractor</th>
                  <th className="text-left p-3 font-medium">Images</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                  <th className="text-left p-3 font-medium">Obstacles</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr
                    key={`${item.structureId}-${item.activityId || "structure"}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 font-medium">{item.structureCode}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{item.structureName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.structureDescription}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getPriorityColor(item.structurePriority)}>{item.structurePriority}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-purple-100 text-purple-800">{item.structureClassification}</Badge>
                    </td>
                    <td className="p-3">{item.activityName || "-"}</td>
                    <td className="p-3">{item.activityType || "-"}</td>
                    <td className="p-3">
                      {item.activityProgress !== undefined ? (
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={item.activityProgress} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{item.activityProgress}%</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{item.activityResponsibility || "-"}</td>
                    <td className="p-3">
                      {item.activityPriority ? (
                        <Badge className={getPriorityColor(item.activityPriority)}>{item.activityPriority}</Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{item.activitySubcontractor || "-"}</td>
                    <td className="p-3">
                      {item.activityImageCount && item.activityImageCount > 0 ? (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{item.activityImageCount}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs truncate" title={item.activityNotes}>
                        {item.activityNotes || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs truncate" title={item.activityObstacles}>
                        {item.activityObstacles || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No data matches your current filters. Try adjusting your search or filter criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
