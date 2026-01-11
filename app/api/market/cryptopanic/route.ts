import { NextResponse } from "next/server"
import { getFromCache, setInCache } from "@/lib/api-cache"

const CRYPTOPANIC_API_KEY = process.env.CRYPTOPANIC_API_KEY

export async function GET() {
  try {
    const cacheKey = "cryptopanic-news"
    const cached = getFromCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    if (!CRYPTOPANIC_API_KEY) {
      return NextResponse.json({ error: "CryptoPanic API key not configured" }, { status: 500 })
    }

    // Fetch news from CryptoPanic API
    // Filter for gold/commodities/forex related news
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_API_KEY}&public=true&kind=news&filter=hot`

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error("CryptoPanic API error:", response.status)
      return NextResponse.json([])
    }

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([])
    }

    // Transform the data to our format
    const headlines = data.results.slice(0, 15).map(
      (item: {
        id: number
        title: string
        published_at: string
        source: { title: string }
        votes: { positive: number; negative: number; important: number }
        domain: string
        url: string
        kind: string
      }) => ({
        id: item.id.toString(),
        title: item.title,
        source: item.source?.title || item.domain || "CryptoPanic",
        publishedAt: item.published_at,
        url: item.url,
        votes: item.votes,
        sentiment: determineSentiment(item.votes),
        impactScore: calculateImpactScore(item.votes),
        category: categorizeNews(item.title),
      }),
    )

    setInCache(cacheKey, headlines, 120000) // Cache for 2 minutes
    return NextResponse.json(headlines)
  } catch (error) {
    console.error("CryptoPanic API error:", error)
    return NextResponse.json([])
  }
}

function determineSentiment(votes: { positive: number; negative: number; important: number }):
  | "bullish"
  | "bearish"
  | "neutral" {
  if (!votes) return "neutral"
  const { positive, negative } = votes
  if (positive > negative * 1.5) return "bullish"
  if (negative > positive * 1.5) return "bearish"
  return "neutral"
}

function calculateImpactScore(votes: { positive: number; negative: number; important: number }): number {
  if (!votes) return 50
  const { positive, negative, important } = votes
  const total = positive + negative + important
  // Base score 50, add up to 45 points based on engagement
  return Math.min(95, Math.floor(50 + Math.min(total * 3, 45)))
}

function categorizeNews(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes("fed") || lower.includes("rate") || lower.includes("powell")) return "BANCO CENTRAL"
  if (lower.includes("bitcoin") || lower.includes("btc") || lower.includes("crypto")) return "CRYPTO"
  if (lower.includes("gold") || lower.includes("xau") || lower.includes("oro")) return "ORO"
  if (lower.includes("dxy") || lower.includes("dollar") || lower.includes("usd")) return "FOREX"
  if (lower.includes("china") || lower.includes("tariff") || lower.includes("trade")) return "GEOPOLITICA"
  if (lower.includes("inflation") || lower.includes("cpi") || lower.includes("nfp")) return "DATOS ECONOMICOS"
  return "MERCADO"
}
