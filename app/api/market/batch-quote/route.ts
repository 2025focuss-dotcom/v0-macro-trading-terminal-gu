import { type NextRequest, NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 15 * 60 * 1000

const FALLBACK_DATA: Record<string, unknown> = {
  "^VIX": { symbol: "^VIX", name: "CBOE Volatility Index", price: 18.5, changesPercentage: -2.1 },
  "DX-Y.NYB": { symbol: "DX-Y.NYB", name: "US Dollar Index", price: 108.45, changesPercentage: -0.32 },
  "^TNX": { symbol: "^TNX", name: "10-Year Treasury", price: 4.45, changesPercentage: 0.15 },
}

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get("symbols")

  if (!symbols) {
    return NextResponse.json([], { status: 200 })
  }

  const cacheKey = `batch-quote:${symbols}`
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    const fallback = symbols
      .split(",")
      .map((s) => FALLBACK_DATA[s] || { symbol: s, price: 0, changesPercentage: 0 })
      .filter(Boolean)
    return NextResponse.json(fallback, { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/batch-quote?symbols=${symbols}&apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Batch quote fetch failed (${res.status}):`, errorText)
      const fallback = symbols
        .split(",")
        .map((s) => FALLBACK_DATA[s] || { symbol: s, price: 0, changesPercentage: 0 })
        .filter(Boolean)
      setCache(cacheKey, fallback)
      return NextResponse.json(fallback, { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("Batch quote data is not an array:", data)
      const fallback = symbols
        .split(",")
        .map((s) => FALLBACK_DATA[s] || { symbol: s, price: 0, changesPercentage: 0 })
        .filter(Boolean)
      setCache(cacheKey, fallback)
      return NextResponse.json(fallback, { status: 200 })
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching batch quotes:", error)
    const fallback = symbols
      .split(",")
      .map((s) => FALLBACK_DATA[s] || { symbol: s, price: 0, changesPercentage: 0 })
      .filter(Boolean)
    setCache(cacheKey, fallback)
    return NextResponse.json(fallback, { status: 200 })
  }
}
