import { type NextRequest, NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 2 * 60 * 1000

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")
  const interval = request.nextUrl.searchParams.get("interval") || "5min"

  if (!symbol) {
    return NextResponse.json([], { status: 200 })
  }

  const cacheKey = `intraday:${symbol}:${interval}`
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/historical-chart/${interval}?symbol=${symbol}&apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Intraday fetch failed (${res.status}):`, errorText)
      return NextResponse.json([], { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("Intraday data is not an array:", data)
      return NextResponse.json([], { status: 200 })
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching intraday chart:", error)
    return NextResponse.json([], { status: 200 })
  }
}
