import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"

export async function GET() {
  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json({ gainers: [], losers: [] }, { status: 200 })
  }

  try {
    const [gainersRes, losersRes] = await Promise.all([
      fetch(`${BASE_URL}/stable/gainers?apikey=${FMP_API_KEY}`),
      fetch(`${BASE_URL}/stable/losers?apikey=${FMP_API_KEY}`),
    ])

    let gainers: any[] = []
    let losers: any[] = []

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

    return NextResponse.json({ gainers, losers })
  } catch (error) {
    console.error("Error fetching market movers:", error)
    return NextResponse.json({ gainers: [], losers: [] }, { status: 200 })
  }
}
