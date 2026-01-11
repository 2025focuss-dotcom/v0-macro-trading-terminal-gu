"use client"

import { motion } from "framer-motion"
import { Activity, TrendingDown, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { useQuote, useFearGreedIndex } from "@/hooks/use-market-data"

export function InstitutionalHeader() {
  const { quote: goldQuote, isLoading: goldLoading } = useQuote("GCUSD")
  const { fearGreed, isLoading: fearLoading } = useFearGreedIndex()

  const price = goldQuote?.price || 0
  const changePercent = goldQuote?.changesPercentage || 0
  const isPositive = changePercent >= 0

  // Fear & Greed classification
  const fearValue = fearGreed?.value || 50
  const fearClassification = fearGreed?.valueClassification || "Neutral"

  const getSentimentColor = (value: number) => {
    if (value <= 25) return "#ff2e5b" // Extreme Fear
    if (value <= 45) return "#ff8c00" // Fear
    if (value <= 55) return "#888" // Neutral
    if (value <= 75) return "#0df2c9" // Greed
    return "#0df2c9" // Extreme Greed
  }

  const getSentimentLabel = (classification: string) => {
    const labels: Record<string, string> = {
      "Extreme Fear": "EXTREME FEAR",
      Fear: "FEAR",
      Neutral: "NEUTRAL",
      Greed: "GREED",
      "Extreme Greed": "EXTREME GREED",
    }
    return labels[classification] || classification.toUpperCase()
  }

  return (
    <div className="glass border-b border-[#7d41ff]/30 p-3">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#0df2c9] animate-pulse" />
            <span className="font-mono text-xs italic uppercase tracking-wider text-[#7d41ff]">MACRO INTEL CMD</span>
          </div>
          <div className="h-6 w-px bg-[#7d41ff]/30" />
          <span className="font-sans text-2xl font-black italic uppercase tracking-tight">XAUUSD</span>

          {goldLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#7d41ff]" />
          ) : (
            <>
              <span className="font-mono text-lg text-[#0df2c9] font-bold">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`font-mono text-xs ${isPositive ? "text-[#0df2c9]" : "text-[#ff2e5b]"} flex items-center gap-1`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </>
          )}
        </div>

        {/* Institutional Logos */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 opacity-40">
            <span className="font-sans text-xs font-bold italic uppercase tracking-wider">GOLDMAN SACHS</span>
            <span className="font-sans text-xs font-bold italic uppercase tracking-wider">J.P. MORGAN</span>
          </div>

          <div className="h-6 w-px bg-[#7d41ff]/30" />

          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(125, 65, 255, 0.2)"
                  strokeWidth="2"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={getSentimentColor(fearValue)}
                  strokeWidth="2"
                  strokeDasharray={`${fearValue}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${fearValue}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {fearLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#7d41ff]" />
                ) : (
                  <span className="font-mono text-[10px] font-bold" style={{ color: getSentimentColor(fearValue) }}>
                    {Math.round(fearValue)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#888] italic uppercase">SENTIMENT</span>
              <span
                className="font-sans text-xs font-black italic uppercase tracking-tight flex items-center gap-1"
                style={{ color: getSentimentColor(fearValue) }}
              >
                {fearValue <= 25 && <AlertTriangle className="w-3 h-3" />}
                {getSentimentLabel(fearClassification)}
              </span>
              <span className="font-mono text-[10px] text-[#0df2c9] italic uppercase">
                {fearValue <= 25 ? "(ACCUMULATION)" : fearValue >= 75 ? "(DISTRIBUTION)" : ""}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#7d41ff]/30" />

          {/* Live Status */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0df2c9] animate-pulse" />
            <span className="font-mono text-xs italic uppercase text-[#0df2c9]">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
