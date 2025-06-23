import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Structure, Responsibility, Priority } from "../types"

interface ProjectOverviewProps {
  totalStructures: number
  totalActivities: number
  overallProgress: number
  structures: Structure[]
}

function StatCard({ title, value, progress }: { title: string; value: string | number; progress?: number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {progress !== undefined && <Progress value={progress} className="h-2" />}
    </div>
  )
}

export function ProjectOverview({
  totalStructures,
  totalActivities,
  overallProgress,
  structures,
}: ProjectOverviewProps) {
  const responsibilityStats = structures.reduce(
    (acc, structure) => {
      structure.activities.forEach((activity) => {
        acc[activity.responsibility] = (acc[activity.responsibility] || 0) + 1
      })
      return acc
    },
    {} as Record<Responsibility, number>,
  )

  const priorityStats = structures.reduce(
    (acc, structure) => {
      acc[structure.priority] = (acc[structure.priority] || 0) + 1
      structure.activities.forEach((activity) => {
        acc[`activity-${activity.priority}`] = (acc[`activity-${activity.priority}`] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Structures" value={totalStructures} />
          <StatCard title="Total Activities" value={totalActivities} />
          <StatCard title="Overall Progress" value={`${overallProgress}%`} progress={overallProgress} />
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Responsibility Distribution</h3>
            <div className="space-y-1">
              {(["HCC", "ALKE", "PWA"] as Responsibility[]).map((resp) => (
                <div key={resp} className="flex justify-between">
                  <span>{resp}:</span>
                  <span>{responsibilityStats[resp] || 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h3 className="font-semibold mb-2">Priority Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Structures</h4>
                {(["Critical", "High", "Medium", "Low"] as Priority[]).map((priority) => (
                  <div key={`struct-${priority}`} className="flex justify-between">
                    <span>{priority}:</span>
                    <span>{priorityStats[priority] || 0}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Activities</h4>
                {(["Critical", "High", "Medium", "Low"] as Priority[]).map((priority) => (
                  <div key={`activity-${priority}`} className="flex justify-between">
                    <span>{priority}:</span>
                    <span>{priorityStats[`activity-${priority}`] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
