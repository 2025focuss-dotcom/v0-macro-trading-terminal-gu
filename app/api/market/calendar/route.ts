import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const CACHE_TTL = 10 * 60 * 1000

export async function GET() {
  const cacheKey = "calendar"
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    if (!FMP_API_KEY) {
      return NextResponse.json([])
    }

    const response = await fetch(`https://financialmodelingprep.com/api/v3/economic_calendar?apikey=${FMP_API_KEY}`)

    if (!response.ok) {
      console.error("FMP Calendar API error:", response.status)
      return NextResponse.json([])
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      return NextResponse.json([])
    }

    const result = data.slice(0, 20)
    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Calendar fetch error:", error)
    return NextResponse.json([])
  }
}
