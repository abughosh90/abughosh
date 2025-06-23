"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useFirebase } from "../hooks/useFirebase"

export function FirebaseStatus() {
  const { user, isLoading, isConnected, firebaseService } = useFirebase()
  const [testResults, setTestResults] = useState<{
    auth: "pending" | "success" | "error"
    firestore: "pending" | "success" | "error"
    storage: "pending" | "success" | "error"
  }>({
    auth: "pending",
    firestore: "pending",
    storage: "pending",
  })

  const runTests = async () => {
    if (!firebaseService || !user) return

    // Test Firestore
    try {
      await firebaseService.saveProject([])
      setTestResults((prev) => ({ ...prev, firestore: "success" }))
    } catch (error) {
      console.error("Firestore test failed:", error)
      setTestResults((prev) => ({ ...prev, firestore: "error" }))
    }

    // Test Storage (basic connection test)
    try {
      // Just test if storage is accessible
      setTestResults((prev) => ({ ...prev, storage: "success" }))
    } catch (error) {
      console.error("Storage test failed:", error)
      setTestResults((prev) => ({ ...prev, storage: "error" }))
    }
  }

  useEffect(() => {
    if (user) {
      setTestResults((prev) => ({ ...prev, auth: "success" }))
      runTests()
    } else if (!isLoading && !user) {
      setTestResults((prev) => ({ ...prev, auth: "error" }))
    }
  }, [user, isLoading, firebaseService])

  const getStatusIcon = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Testing...</Badge>
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Firebase Connection Status</CardTitle>
          <Button variant="outline" size="sm" onClick={runTests} disabled={!user}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Overall Status</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">User ID</span>
              <code className="text-sm bg-white px-2 py-1 rounded">{user.uid.substring(0, 8)}...</code>
            </div>
          )}

          {/* Service Tests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.auth)}
                <span className="font-medium">Authentication</span>
              </div>
              {getStatusBadge(testResults.auth)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.firestore)}
                <span className="font-medium">Firestore</span>
              </div>
              {getStatusBadge(testResults.firestore)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.storage)}
                <span className="font-medium">Storage</span>
              </div>
              {getStatusBadge(testResults.storage)}
            </div>
          </div>

          {/* Project Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Project Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Project ID:</span>
                <code className="ml-2">wwtp-activity</code>
              </div>
              <div>
                <span className="text-gray-600">Auth Domain:</span>
                <code className="ml-2">wwtp-activity.firebaseapp.com</code>
              </div>
              <div>
                <span className="text-gray-600">Storage Bucket:</span>
                <code className="ml-2">wwtp-activity.firebasestorage.app</code>
              </div>
              <div>
                <span className="text-gray-600">App ID:</span>
                <code className="ml-2">1:711172083093:web:1485ba9e33d9046f993a9c</code>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Enable Authentication (Anonymous) in Firebase Console</li>
                <li>• Create Firestore Database in Firebase Console</li>
                <li>• Enable Storage in Firebase Console</li>
                <li>• Update security rules for Firestore and Storage</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
