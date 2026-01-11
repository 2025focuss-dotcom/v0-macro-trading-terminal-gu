import { type NextRequest, NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 15 * 60 * 1000

const FALLBACK_DATA: Record<string, unknown> = {
  GCUSD: {
    symbol: "GCUSD",
    name: "Gold",
    price: 2685.5,
    changesPercentage: 0.45,
    change: 12.05,
    dayHigh: 2695.2,
    dayLow: 2672.3,
    previousClose: 2673.45,
    open: 2678.9,
  },
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold Spot",
    price: 2685.5,
    changesPercentage: 0.45,
    change: 12.05,
    dayHigh: 2695.2,
    dayLow: 2672.3,
    previousClose: 2673.45,
    open: 2678.9,
  },
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json([], { status: 200 })
  }

  const cacheKey = `quote:${symbol}`
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    const fallback = FALLBACK_DATA[symbol] ? [FALLBACK_DATA[symbol]] : []
    return NextResponse.json(fallback, { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/quote?symbol=${symbol}&apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Quote fetch failed (${res.status}):`, errorText)
      const fallback = FALLBACK_DATA[symbol] ? [FALLBACK_DATA[symbol]] : []
      setCache(cacheKey, fallback)
      return NextResponse.json(fallback, { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("Quote data is not an array:", data)
      const fallback = FALLBACK_DATA[symbol] ? [FALLBACK_DATA[symbol]] : []
      setCache(cacheKey, fallback)
      return NextResponse.json(fallback, { status: 200 })
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching quote:", error)
    const fallback = FALLBACK_DATA[symbol] ? [FALLBACK_DATA[symbol]] : []
    setCache(cacheKey, fallback)
    return NextResponse.json(fallback, { status: 200 })
  }
}
