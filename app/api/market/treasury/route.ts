import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 30 * 60 * 1000

const FALLBACK_DATA = [
  {
    date: new Date().toISOString().split("T")[0],
    month1: 4.35,
    month2: 4.38,
    month3: 4.42,
    month6: 4.55,
    year1: 4.65,
    year2: 4.52,
    year5: 4.38,
    year10: 4.45,
    year20: 4.72,
    year30: 4.68,
  },
]

export async function GET() {
  const cacheKey = "treasury"
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json(FALLBACK_DATA, { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/treasury-rates?apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Treasury fetch failed (${res.status}):`, errorText)
      setCache(cacheKey, FALLBACK_DATA)
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      console.error("Treasury data is not an array:", data)
      setCache(cacheKey, FALLBACK_DATA)
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching treasury rates:", error)
    setCache(cacheKey, FALLBACK_DATA)
    return NextResponse.json(FALLBACK_DATA, { status: 200 })
  }
}
