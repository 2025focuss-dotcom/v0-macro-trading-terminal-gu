import { NextResponse } from "next/server"
import { getCached, setCache } from "@/lib/api-cache"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"
const CACHE_TTL = 10 * 60 * 1000

export async function GET() {
  const cacheKey = "fear-greed"
  const cached = getCached<unknown[]>(cacheKey, CACHE_TTL)
  if (cached) {
    return NextResponse.json(cached)
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/market-risk-premium?apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Fear greed fetch failed (${res.status}):`, errorText)
      return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
    }

    const riskPremium = data[0]?.totalEquityRiskPremium || 5
    const fearGreedValue = Math.max(0, Math.min(100, 50 - (riskPremium - 5) * 10))
    const classification =
      fearGreedValue < 25
        ? "Extreme Fear"
        : fearGreedValue < 45
          ? "Fear"
          : fearGreedValue < 55
            ? "Neutral"
            : fearGreedValue < 75
              ? "Greed"
              : "Extreme Greed"

    const result = [{ value: Math.round(fearGreedValue), classification }]
    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching fear greed index:", error)
    return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
  }
}
