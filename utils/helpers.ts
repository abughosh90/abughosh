import type { Priority } from "../types"

export const generateId = () => crypto.randomUUID()

export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "Critical":
      return "bg-red-500 text-white"
    case "High":
      return "bg-orange-500 text-white"
    case "Medium":
      return "bg-yellow-500 text-black"
    case "Low":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-200 text-black"
  }
}
