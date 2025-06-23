"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeleteConfirmationDialogProps {
  onCancel: () => void
  onConfirm: () => void
  type: "structure" | "activity"
  itemName?: string
}

export function DeleteConfirmationDialog({ onCancel, onConfirm, type, itemName }: DeleteConfirmationDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    if (password === "1234") {
      onConfirm()
      setPassword("")
      setError("")
    } else {
      setError("Incorrect password")
    }
  }

  const handleCancel = () => {
    setPassword("")
    setError("")
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Are you sure you want to delete this {type}
            {itemName ? ` "${itemName}"` : ""}
            {type === "structure" ? " and all its activities" : ""}?
          </p>
          <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>

          <div className="mt-4 space-y-2">
            <Label htmlFor="delete-password">Enter password to confirm:</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm()
                }
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!password.trim()}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  )
}
