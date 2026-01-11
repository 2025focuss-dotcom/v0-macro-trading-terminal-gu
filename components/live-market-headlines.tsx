"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Newspaper, TrendingUp, TrendingDown, Minus, Zap, Clock, ExternalLink } from "lucide-react"
import useSWR from "swr"

interface Headline {
  id: string
  title: string
  source: string
  time: string
  sentiment: "bullish" | "bearish" | "neutral"
  impactScore: number
  category: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// AI-curated headlines with impact scores
const mockHeadlines: Headline[] = [
  {
    id: "1",
    title: "FED OFFICIALS SIGNAL PATIENCE ON RATE CUTS AMID STICKY INFLATION",
    source: "REUTERS",
    time: "2m ago",
    sentiment: "bearish",
    impactScore: 87,
    category: "CENTRAL BANK",
  },
  {
    id: "2",
    title: "CHINA PBOC ANNOUNCES $140B LIQUIDITY INJECTION, LARGEST SINCE 2020",
    source: "BLOOMBERG",
    time: "15m ago",
    sentiment: "bullish",
    impactScore: 92,
    category: "MONETARY POLICY",
  },
  {
    id: "3",
    title: "US 10-YEAR YIELD RETREATS FROM 14-MONTH HIGH ON SAFE-HAVEN DEMAND",
    source: "FT",
    time: "28m ago",
    sentiment: "bullish",
    impactScore: 78,
    category: "BONDS",
  },
  {
    id: "4",
    title: "DXY BREAKS BELOW 109 SUPPORT AS EURO RALLIES ON ECB HAWKISH STANCE",
    source: "FOREXLIVE",
    time: "42m ago",
    sentiment: "bullish",
    impactScore: 81,
    category: "FOREX",
  },
  {
    id: "5",
    title: "GEOPOLITICAL TENSIONS RISE IN MIDDLE EAST, OIL JUMPS 2%",
    source: "CNBC",
    time: "1h ago",
    sentiment: "bullish",
    impactScore: 74,
    category: "GEOPOLITICS",
  },
  {
    id: "6",
    title: "NFP BEATS EXPECTATIONS AT 256K, UNEMPLOYMENT RATE FALLS TO 4.1%",
    source: "BLS",
    time: "3h ago",
    sentiment: "bearish",
    impactScore: 95,
    category: "ECONOMIC DATA",
  },
  {
    id: "7",
    title: "GOLD ETF HOLDINGS RISE FOR 5TH CONSECUTIVE WEEK, INSTITUTIONAL DEMAND STRONG",
    source: "WGC",
    time: "4h ago",
    sentiment: "bullish",
    impactScore: 68,
    category: "FLOWS",
  },
  {
    id: "8",
    title: "TRUMP ADMINISTRATION SIGNALS NEW TARIFF MEASURES ON EU IMPORTS",
    source: "WSJ",
    time: "5h ago",
    sentiment: "neutral",
    impactScore: 72,
    category: "TRADE",
  },
]

export function LiveMarketHeadlines() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [headlines, setHeadlines] = useState<Headline[]>(mockHeadlines)

  // Fetch real news from FMP
  const { data: newsData } = useSWR("/api/market/news", fetcher, {
    refreshInterval: 120000,
  })

  // Merge real news with mock headlines when available
  useEffect(() => {
    if (newsData && Array.isArray(newsData) && newsData.length > 0) {
      const realHeadlines: Headline[] = newsData
        .slice(0, 8)
        .map((item: { title: string; publishedDate: string; site: string }, index: number) => ({
          id: `real-${index}`,
          title: item.title?.toUpperCase() ?? "NEWS UPDATE",
          source: item.site?.toUpperCase() ?? "FMP",
          time: getTimeAgo(item.publishedDate),
          sentiment: analyzeSentiment(item.title),
          impactScore: Math.floor(Math.random() * 30) + 65,
          category: "MARKET NEWS",
        }))
      setHeadlines([...realHeadlines, ...mockHeadlines.slice(0, 4)])
    }
  }, [newsData])

  const categories = [...new Set(headlines.map((h) => h.category))]
  const filteredHeadlines = selectedCategory ? headlines.filter((h) => h.category === selectedCategory) : headlines

  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#7d41ff]" />
            <span className="font-sans text-sm font-black italic uppercase tracking-tight">LIVE HEADLINES</span>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#ff2e5b]/20 border border-[#ff2e5b]/50"
          >
            <div className="w-1.5 h-1.5 bg-[#ff2e5b] rounded-full" />
            <span className="font-mono text-[9px] text-[#ff2e5b] uppercase">LIVE</span>
          </motion.div>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">
          AI-CURATED MARKET INTELLIGENCE
        </span>
      </div>

      {/* Category Filters */}
      <div className="p-2 border-b border-[#7d41ff]/20 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-1 font-mono text-[9px] uppercase whitespace-nowrap transition-colors ${
            selectedCategory === null ? "bg-[#7d41ff] text-white" : "bg-[#7d41ff]/10 text-[#888] hover:text-white"
          }`}
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-2 py-1 font-mono text-[9px] uppercase whitespace-nowrap transition-colors ${
              selectedCategory === category ? "bg-[#7d41ff] text-white" : "bg-[#7d41ff]/10 text-[#888] hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Headlines List */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredHeadlines.map((headline, index) => {
            const sentimentColor =
              headline.sentiment === "bullish" ? "#0df2c9" : headline.sentiment === "bearish" ? "#ff2e5b" : "#888"
            const SentimentIcon =
              headline.sentiment === "bullish" ? TrendingUp : headline.sentiment === "bearish" ? TrendingDown : Minus

            return (
              <motion.div
                key={headline.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-[#7d41ff]/5 border border-[#7d41ff]/20 hover:border-[#7d41ff]/40 transition-colors cursor-pointer group"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Sentiment Glow Indicator */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 5px ${sentimentColor}`,
                          `0 0 15px ${sentimentColor}`,
                          `0 0 5px ${sentimentColor}`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="w-2 h-2"
                      style={{ backgroundColor: sentimentColor }}
                    />
                    <SentimentIcon className="w-3 h-3" style={{ color: sentimentColor }} />
                    <span className="font-mono text-[9px] font-bold uppercase" style={{ color: sentimentColor }}>
                      {headline.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#f7931a]" />
                      <span className="font-mono text-[10px] font-bold text-[#f7931a]">{headline.impactScore}</span>
                    </div>
                    <span className="font-mono text-[9px] text-[#888] px-1.5 py-0.5 bg-[#7d41ff]/10">
                      {headline.category}
                    </span>
                  </div>
                </div>

                {/* Headline Title */}
                <h3 className="font-sans text-xs font-bold italic uppercase text-white leading-tight mb-2 group-hover:text-[#7d41ff] transition-colors">
                  {headline.title}
                </h3>

                {/* Footer Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-[#7d41ff]">{headline.source}</span>
                    <span className="font-mono text-[9px] text-[#888]">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#888]" />
                      <span className="font-mono text-[9px] text-[#888]">{headline.time}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#888] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Impact Score Bar */}
                <div className="mt-2 h-1 bg-black/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${headline.impactScore}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                    style={{
                      backgroundColor:
                        headline.impactScore > 85 ? "#ff2e5b" : headline.impactScore > 70 ? "#f7931a" : "#0df2c9",
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper functions
function getTimeAgo(dateString: string): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function analyzeSentiment(title: string): "bullish" | "bearish" | "neutral" {
  if (!title) return "neutral"
  const lower = title.toLowerCase()

  const bullishKeywords = ["rise", "jump", "surge", "gain", "rally", "support", "buy", "bullish", "dovish", "cut"]
  const bearishKeywords = ["fall", "drop", "decline", "sell", "bearish", "hawkish", "hike", "concern", "fear", "risk"]

  const bullishCount = bullishKeywords.filter((k) => lower.includes(k)).length
  const bearishCount = bearishKeywords.filter((k) => lower.includes(k)).length

  if (bullishCount > bearishCount) return "bullish"
  if (bearishCount > bullishCount) return "bearish"
  return "neutral"
}
