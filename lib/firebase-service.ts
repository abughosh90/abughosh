import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"
import type { Structure } from "../types"

export class FirebaseService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Save project data to Firebase
  async saveProject(structures: Structure[], projectName = "default") {
    try {
      const projectRef = doc(db, "users", this.userId, "projects", projectName)
      await setDoc(
        projectRef,
        {
          structures,
          updatedAt: serverTimestamp(),
          version: "1.0",
        },
        { merge: true },
      )

      console.log("Project saved to Firebase successfully")
      return true
    } catch (error) {
      console.error("Error saving to Firebase:", error)
      throw error
    }
  }

  // Load project data from Firebase
  async loadProject(projectName = "default"): Promise<Structure[] | null> {
    try {
      const projectRef = doc(db, "users", this.userId, "projects", projectName)
      const projectSnap = await getDoc(projectRef)

      if (projectSnap.exists()) {
        const data = projectSnap.data()
        return data.structures || []
      }
      return null
    } catch (error) {
      console.error("Error loading from Firebase:", error)
      throw error
    }
  }

  // Real-time listener for project changes
  subscribeToProject(projectName = "default", callback: (structures: Structure[]) => void) {
    const projectRef = doc(db, "users", this.userId, "projects", projectName)

    return onSnapshot(
      projectRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          callback(data.structures || [])
        }
      },
      (error) => {
        console.error("Error in real-time listener:", error)
      },
    )
  }

  // Upload image to Firebase Storage
  async uploadImage(file: File, activityId: string): Promise<string> {
    try {
      const imageRef = ref(storage, `images/${this.userId}/${activityId}/${file.name}`)
      const snapshot = await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw error
    }
  }

  // Get project backups
  async getProjectBackups(limit_count = 10) {
    try {
      const backupsRef = collection(db, "users", this.userId, "backups")
      const q = query(backupsRef, orderBy("createdAt", "desc"), limit(limit_count))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error getting backups:", error)
      throw error
    }
  }

  // Create project backup
  async createBackup(structures: Structure[], backupName?: string) {
    try {
      const backupRef = doc(collection(db, "users", this.userId, "backups"))
      await setDoc(backupRef, {
        structures,
        name: backupName || `Backup ${new Date().toLocaleString()}`,
        createdAt: serverTimestamp(),
      })

      return backupRef.id
    } catch (error) {
      console.error("Error creating backup:", error)
      throw error
    }
  }

  // Delete project backup
  async deleteBackup(backupId: string) {
    try {
      const backupRef = doc(db, "users", this.userId, "backups", backupId)
      await deleteDoc(backupRef)
    } catch (error) {
      console.error("Error deleting backup:", error)
      throw error
    }
  }
}
