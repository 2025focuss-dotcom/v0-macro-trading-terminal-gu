import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"

export async function GET() {
  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/sectors-performance?apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Sectors fetch failed (${res.status}):`, errorText)
      return NextResponse.json([], { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("Sectors data is not an array:", data)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching sector performance:", error)
    return NextResponse.json([], { status: 200 })
  }
}
