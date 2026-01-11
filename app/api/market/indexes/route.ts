import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 15 * 60 * 1000

const FALLBACK_DATA = [
  { symbol: "^GSPC", name: "S&P 500", price: 5890.25, changesPercentage: 0.45 },
  { symbol: "^DJI", name: "Dow Jones", price: 42650.8, changesPercentage: 0.32 },
  { symbol: "^IXIC", name: "NASDAQ", price: 19420.15, changesPercentage: 0.68 },
  { symbol: "^VIX", name: "VIX", price: 18.5, changesPercentage: -2.1 },
  { symbol: "^TNX", name: "10Y Treasury", price: 4.45, changesPercentage: 0.15 },
]

export async function GET() {
  const cacheKey = "indexes"
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json(FALLBACK_DATA, { status: 200 })
  }

  try {
    const indexSymbols = "^GSPC,^DJI,^IXIC,^VIX,^TNX"
    const res = await fetch(`${BASE_URL}/stable/batch-quote?symbols=${indexSymbols}&apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Index quotes fetch failed (${res.status}):`, errorText)
      setCache(cacheKey, FALLBACK_DATA)
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      console.error("Index data is not an array:", data)
      setCache(cacheKey, FALLBACK_DATA)
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching index quotes:", error)
    setCache(cacheKey, FALLBACK_DATA)
    return NextResponse.json(FALLBACK_DATA, { status: 200 })
  }
}
