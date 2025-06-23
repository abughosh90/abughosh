"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth"
import { auth, firebaseEnabled } from "../lib/firebase"
import { FirebaseService } from "../lib/firebase-service"
import type { Structure } from "../types"

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!firebaseEnabled) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        setFirebaseService(new FirebaseService(user.uid))
        setIsConnected(true)
        console.log("Firebase user authenticated:", user.uid)
      } else {
        // Sign in anonymously if no user
        try {
          console.log("Signing in anonymously...")
          await signInAnonymously(auth)
        } catch (error) {
          console.error("Anonymous sign-in failed:", error)
          setIsConnected(false)
        }
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const saveToFirebase = async (structures: Structure[]) => {
    if (!firebaseService) throw new Error("Firebase not initialized")
    return await firebaseService.saveProject(structures)
  }

  const loadFromFirebase = async (): Promise<Structure[] | null> => {
    if (!firebaseService) throw new Error("Firebase not initialized")
    return await firebaseService.loadProject()
  }

  const subscribeToChanges = (callback: (structures: Structure[]) => void) => {
    if (!firebaseService) return () => {}
    return firebaseService.subscribeToProject("default", callback)
  }

  const createBackup = async (structures: Structure[], name?: string) => {
    if (!firebaseService) throw new Error("Firebase not initialized")
    return await firebaseService.createBackup(structures, name)
  }

  const getBackups = async () => {
    if (!firebaseService) throw new Error("Firebase not initialized")
    return await firebaseService.getProjectBackups()
  }

  return {
    user,
    firebaseService,
    isLoading,
    isConnected,
    saveToFirebase,
    loadFromFirebase,
    subscribeToChanges,
    createBackup,
    getBackups,
  }
}
