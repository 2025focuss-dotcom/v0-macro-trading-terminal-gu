import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"

export async function GET() {
  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/market-risk-premium?apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Fear greed fetch failed (${res.status}):`, errorText)
      // Return fallback data structure for the UI
      return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
    }

    const data = await res.json()

    // Transform market risk premium to fear/greed-like data
    // If no valid data, return neutral fallback
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
    }

    // Use market risk premium as a proxy for sentiment
    const riskPremium = data[0]?.totalEquityRiskPremium || 5
    // Higher risk premium = more fear, lower = more greed
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

    return NextResponse.json([{ value: Math.round(fearGreedValue), classification }])
  } catch (error) {
    console.error("Error fetching fear greed index:", error)
    return NextResponse.json([{ value: 45, classification: "Neutral" }], { status: 200 })
  }
}
