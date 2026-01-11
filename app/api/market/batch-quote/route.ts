import { type NextRequest, NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const BASE_URL = "https://financialmodelingprep.com"

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get("symbols")

  if (!symbols) {
    return NextResponse.json([], { status: 200 })
  }

  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY not configured")
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(`${BASE_URL}/stable/batch-quote?symbols=${symbols}&apikey=${FMP_API_KEY}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Batch quote fetch failed (${res.status}):`, errorText)
      return NextResponse.json([], { status: 200 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error("Batch quote data is not an array:", data)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching batch quotes:", error)
    return NextResponse.json([], { status: 200 })
  }
}
