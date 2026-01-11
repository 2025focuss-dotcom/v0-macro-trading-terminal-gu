import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 5 * 60 * 1000

export async function GET() {
  const cacheKey = "movers"
  const cached = getCached<{ gainers: unknown[]; losers: unknown[] }>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json({ gainers: [], losers: [] }, { status: 200 })
  }

  try {
    const [gainersRes, losersRes] = await Promise.all([
      fetch(`${BASE_URL}/stable/gainers?apikey=${FMP_API_KEY}`),
      fetch(`${BASE_URL}/stable/losers?apikey=${FMP_API_KEY}`),
    ])

    let gainers: unknown[] = []
    let losers: unknown[] = []

    if (gainersRes.ok) {
      const gainersData = await gainersRes.json()
      if (Array.isArray(gainersData)) {
        gainers = gainersData.slice(0, 10)
      }
    } else {
      console.error(`Gainers fetch failed (${gainersRes.status})`)
    }

    if (losersRes.ok) {
      const losersData = await losersRes.json()
      if (Array.isArray(losersData)) {
        losers = losersData.slice(0, 10)
      }
    } else {
      console.error(`Losers fetch failed (${losersRes.status})`)
    }

    const result = { gainers, losers }
    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching market movers:", error)
    return NextResponse.json({ gainers: [], losers: [] }, { status: 200 })
  }
}
