import { type NextRequest, NextResponse } from "next/server"

const GAS_URL =
  "https://script.google.com/macros/s/AKfycby2iORBrwP8FcqYUUGoJL2WY_CPnWIAkdhsz0chQs8vjtGwSSOJqXYURkXqFghXaCY/exec"

// Handles both GET and POST
export async function GET(req: NextRequest) {
  const url = new URL(GAS_URL)
  // Copy all query params
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    method: "GET",
    // Important: let Google return JSON to us
    headers: { "Content-Type": "application/json" },
    // Google doesn’t need any special headers besides query params
  })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "content-type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body,
  })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "content-type": "application/json" },
  })
}
