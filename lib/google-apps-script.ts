/* -------- helper: parse JSON only when it really is JSON ---------- */
async function safeJson<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; raw: string }> {
  const txt = await res.text() // read once
  try {
    return { ok: true, data: JSON.parse(txt) as T }
  } catch {
    return { ok: false, raw: txt } // HTML / plain-text fallback
  }
}
/* ------------------------------------------------------------------ */

interface GoogleAppsScriptResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
  spreadsheetUrl?: string
  documentUrl?: string
  rowCount?: number
}

export class GoogleAppsScriptService {
  private scriptUrl = "/api/gas" // proxy endpoint (same-origin -> no CORS)

  // Add error handling wrapper to catch any remaining fetch issues
  async sendData(data: any, action = "saveData"): Promise<GoogleAppsScriptResponse> {
    try {
      const response = await fetch(this.scriptUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action,
          data: data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          version: "2.1",
        }),
      })

      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const payload = await safeJson<GoogleAppsScriptResponse>(response)

      // If we got HTML instead of JSON, surface a friendly error object
      if (typeof payload === "string") {
        return {
          success: false,
          error: "GAS returned HTML instead of JSON: " + payload.slice(0, 120) + "…",
        }
      }
      return payload
    } catch (error) {
      console.error("Google Apps Script error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /* ---------------- POST wrapper ---------------- */
  private async post(action: string, data: any = {}): Promise<GoogleAppsScriptResponse> {
    const res = await fetch(this.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        version: "2.1",
      }),
    })

    if (res.status >= 400) {
      return { success: false, error: `HTTP ${res.status}` }
    }

    const parsed = await safeJson<GoogleAppsScriptResponse>(res)
    if (parsed.ok) return parsed.data

    // HTML came back – surface a trimmed message
    return {
      success: false,
      error: "GAS returned non-JSON response: " + parsed.raw.slice(0, 120) + "…",
    }
  }

  /* ---------------- GET wrapper ---------------- */
  private async get(action: string, params: Record<string, string> = {}): Promise<GoogleAppsScriptResponse> {
    const url = new URL(this.scriptUrl, window.location.origin)
    url.searchParams.set("action", action)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

    const res = await fetch(url.toString(), { method: "GET" })

    if (res.status >= 400) {
      return { success: false, error: `HTTP ${res.status}` }
    }

    const parsed = await safeJson<GoogleAppsScriptResponse>(res)
    if (parsed.ok) return parsed.data

    return {
      success: false,
      error: "GAS returned non-JSON response: " + parsed.raw.slice(0, 120) + "…",
    }
  }

  /* ----------- Public API ------------ */
  testConnection() {
    return this.post("ping")
  }
  saveStructures(s: any[]) {
    return this.post("saveStructures", s)
  }
  loadStructures() {
    return this.get("loadStructures")
  }
  createBackup(s: any[], n?: string) {
    return this.post("createBackup", { structures: s, backupName: n })
  }
  listBackups() {
    return this.get("listBackups")
  }
  restoreBackup(id: string) {
    return this.get("restoreBackup", { backupId: id })
  }
  generateProgressReport(s: any[]) {
    return this.post("generateProgressReport", { structures: s })
  }
  generateActivityReport(s: any[]) {
    return this.post("generateActivityReport", { structures: s })
  }
  exportToCSV(s: any[]) {
    return this.post("exportToCSV", s)
  }
  syncImages(s: any[]) {
    return this.post("syncImages", s)
  }
  getSystemInfo() {
    return this.get("getSystemInfo")
  }

  /* ---------- stats helpers (unchanged) ---------- */
  private groupBy(arr: any[], prop: string) {
    return arr.reduce((a, i) => ((a[i[prop]] = 1 + (a[i[prop]] || 0)), a), {})
  }
  private calculateStatistics(structs: any[]) {
    const acts = structs.flatMap((s: any) => s.activities || [])
    return { byResponsibility: this.groupBy(acts, "responsibility"), byType: this.groupBy(acts, "type") }
  }
  private calculateActivitySummary(acts: any[]) {
    return { total: acts.length, averageProgress: acts.reduce((p, a) => p + a.progress, 0) / acts.length }
  }
}
