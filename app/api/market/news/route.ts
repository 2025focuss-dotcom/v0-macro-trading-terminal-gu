import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const CACHE_TTL = 5 * 60 * 1000

export async function GET() {
  const cacheKey = "news"
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    if (!FMP_API_KEY) {
      return NextResponse.json([])
    }

    const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?limit=15&apikey=${FMP_API_KEY}`)

    if (!response.ok) {
      console.error("FMP News API error:", response.status)
      return NextResponse.json([])
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      return NextResponse.json([])
    }

    setCache(cacheKey, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("News fetch error:", error)
    return NextResponse.json([])
  }
}
