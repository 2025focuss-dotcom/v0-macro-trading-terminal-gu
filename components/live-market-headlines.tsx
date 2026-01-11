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
  url?: string
}

interface CryptoPanicHeadline {
  id: string
  title: string
  source: string
  publishedAt: string
  url: string
  sentiment: "bullish" | "bearish" | "neutral"
  impactScore: number
  category: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Fallback headlines when API is not available
const fallbackHeadlines: Headline[] = [
  {
    id: "1",
    title: "FUNCIONARIOS DE LA FED MUESTRAN PACIENCIA CON LOS RECORTES DE TASAS EN MEDIO DE INFLACIÓN FIRME",
    source: "REUTERS",
    time: "Hace 2m",
    sentiment: "bearish",
    impactScore: 87,
    category: "BANCO CENTRAL",
  },
  {
    id: "2",
    title: "EL BANCO POPULAR DE CHINA ANUNCIA INYECCIÓN DE LIQUIDEZ DE $140.000 MILLONES, LA MAYOR DESDE 2020",
    source: "BLOOMBERG",
    time: "Hace 15m",
    sentiment: "bullish",
    impactScore: 92,
    category: "POLÍTICA MONETARIA",
  },
  {
    id: "3",
    title: "RENDIMIENTO DEL BONO US 10Y RETROCEDE DESDE MÁXIMO DE 14 MESES POR DEMANDA DE REFUGIO SEGURO",
    source: "FT",
    time: "Hace 28m",
    sentiment: "bullish",
    impactScore: 78,
    category: "BONOS",
  },
  {
    id: "4",
    title: "DXY ROMPE SOPORTE DE 109 MIENTRAS EURO SUBE POR POSTURA HAWKISH DEL BCE",
    source: "FOREXLIVE",
    time: "Hace 42m",
    sentiment: "bullish",
    impactScore: 81,
    category: "FOREX",
  },
  {
    id: "5",
    title: "TENSIONES GEOPOLÍTICAS AUMENTAN EN MEDIO ORIENTE, PETRÓLEO SALTA 2%",
    source: "CNBC",
    time: "Hace 1h",
    sentiment: "bullish",
    impactScore: 74,
    category: "GEOPOLÍTICA",
  },
  {
    id: "6",
    title: "NFP SUPERA EXPECTATIVAS EN 256K, TASA DE DESEMPLEO CAE A 4.1%",
    source: "BLS",
    time: "Hace 3h",
    sentiment: "bearish",
    impactScore: 95,
    category: "DATOS ECONÓMICOS",
  },
]

export function LiveMarketHeadlines() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [headlines, setHeadlines] = useState<Headline[]>(fallbackHeadlines)

  // Fetch from CryptoPanic API
  const { data: cryptoPanicData } = useSWR<CryptoPanicHeadline[]>("/api/market/cryptopanic", fetcher, {
    refreshInterval: 120000, // Refresh every 2 minutes
  })

  // Update headlines when API data arrives
  useEffect(() => {
    if (cryptoPanicData && Array.isArray(cryptoPanicData) && cryptoPanicData.length > 0) {
      const apiHeadlines: Headline[] = cryptoPanicData.map((item) => ({
        id: item.id,
        title: item.title.toUpperCase(),
        source: item.source.toUpperCase(),
        time: getTimeAgo(item.publishedAt),
        sentiment: item.sentiment,
        impactScore: item.impactScore,
        category: item.category,
        url: item.url,
      }))
      setHeadlines(apiHeadlines)
    }
  }, [cryptoPanicData])

  const categories = [...new Set(headlines.map((h) => h.category))]
  const filteredHeadlines = selectedCategory ? headlines.filter((h) => h.category === selectedCategory) : headlines

  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#7d41ff]" />
            <span className="font-sans text-sm font-black italic uppercase tracking-tight">TITULARES EN VIVO</span>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#ff2e5b]/20 border border-[#ff2e5b]/50"
          >
            <div className="w-1.5 h-1.5 bg-[#ff2e5b] rounded-full" />
            <span className="font-mono text-[9px] text-[#ff2e5b] uppercase">VIVIR</span>
          </motion.div>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">
          INTELIGENCIA DE MERCADO CURADEA POR IA
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
          TODO
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
              <motion.a
                key={headline.id}
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="block p-3 bg-[#7d41ff]/5 border border-[#7d41ff]/20 hover:border-[#7d41ff]/40 transition-colors cursor-pointer group"
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
                      {headline.sentiment === "bullish"
                        ? "ALCISTA"
                        : headline.sentiment === "bearish"
                          ? "BAJISTA"
                          : "NEUTRAL"}
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
              </motion.a>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper function
function getTimeAgo(dateString: string): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `Hace ${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  return `Hace ${Math.floor(diffHours / 24)}d`
}
