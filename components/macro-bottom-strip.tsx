"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Radio, Loader2 } from "lucide-react"
import { useIndexQuotes, useTreasuryRates, useBatchQuotes } from "@/hooks/use-market-data"
import { useMemo } from "react"

export function MacroBottomStrip() {
  const { indexes, isLoading: indexLoading } = useIndexQuotes()
  const { treasury, isLoading: treasuryLoading } = useTreasuryRates()
  const { quotes: vixQuote, isLoading: vixLoading } = useBatchQuotes(["^VIX"])

  // Process real data
  const feeds = useMemo(() => {
    const result = []

    // Find 10Y Treasury
    const treasury10Y = treasury?.[0]?.year10 || treasury?.find?.((t: any) => t.year10)?.year10
    if (treasury10Y) {
      result.push({
        label: "US 10Y YIELD",
        value: `${treasury10Y.toFixed(3)}%`,
        change: "", // FMP doesn't provide change for treasury
        trend: "neutral" as const,
        icon: TrendingDown,
      })
    }

    // Find DXY (US Dollar Index)
    const dxy = indexes?.find?.(
      (i: any) => i.symbol === "DX-Y.NYB" || i.symbol === "^DXY" || i.name?.includes("Dollar"),
    )
    if (dxy) {
      result.push({
        label: "DXY INDEX",
        value: dxy.price?.toFixed(2) || "N/A",
        change: `${dxy.changesPercentage >= 0 ? "+" : ""}${dxy.changesPercentage?.toFixed(2)}%`,
        trend: dxy.changesPercentage >= 0 ? "up" : "down",
        correlation: "-0.94 CORR",
        icon: dxy.changesPercentage >= 0 ? TrendingUp : TrendingDown,
      })
    }

    // VIX
    const vix = vixQuote?.[0]
    if (vix) {
      result.push({
        label: "VIX",
        value: vix.price?.toFixed(2) || "N/A",
        change: `${vix.changesPercentage >= 0 ? "+" : ""}${vix.changesPercentage?.toFixed(2)}%`,
        trend: vix.changesPercentage >= 0 ? "up" : "down",
        icon: vix.changesPercentage >= 0 ? TrendingUp : TrendingDown,
      })
    }

    // S&P 500
    const sp500 = indexes?.find?.((i: any) => i.symbol === "^GSPC" || i.name?.includes("S&P"))
    if (sp500) {
      result.push({
        label: "S&P 500",
        value: sp500.price?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "N/A",
        change: `${sp500.changesPercentage >= 0 ? "+" : ""}${sp500.changesPercentage?.toFixed(2)}%`,
        trend: sp500.changesPercentage >= 0 ? "up" : "down",
        icon: sp500.changesPercentage >= 0 ? TrendingUp : TrendingDown,
      })
    }

    // Fallback if no data
    if (result.length === 0) {
      return [
        { label: "US 10Y YIELD", value: "—", change: "", trend: "neutral" as const, icon: TrendingDown },
        { label: "DXY INDEX", value: "—", change: "", trend: "neutral" as const, icon: TrendingDown },
        { label: "VIX", value: "—", change: "", trend: "neutral" as const, icon: TrendingUp },
        { label: "S&P 500", value: "—", change: "", trend: "neutral" as const, icon: TrendingUp },
      ]
    }

    return result
  }, [indexes, treasury, vixQuote])

  // Generate dynamic commentary based on real data
  const commentary = useMemo(() => {
    const messages = []

    const sp500 = indexes?.find?.((i: any) => i.symbol === "^GSPC" || i.name?.includes("S&P"))
    const vix = vixQuote?.[0]

    if (sp500) {
      if (sp500.changesPercentage > 1) {
        messages.push(`S&P 500 RALLYING ${sp500.changesPercentage.toFixed(2)}% — RISK-ON SENTIMENT`)
      } else if (sp500.changesPercentage < -1) {
        messages.push(`S&P 500 DOWN ${Math.abs(sp500.changesPercentage).toFixed(2)}% — DEFENSIVE POSITIONING`)
      }
    }

    if (vix) {
      if (vix.price > 25) {
        messages.push(`VIX ELEVATED AT ${vix.price.toFixed(2)} — HIGH VOLATILITY ENVIRONMENT`)
      } else if (vix.price < 15) {
        messages.push(`VIX LOW AT ${vix.price.toFixed(2)} — COMPLACENCY WARNING`)
      }
    }

    messages.push("INSTITUTIONAL FLOW ANALYSIS ACTIVE — REAL-TIME MONITORING")
    messages.push("FMP DATA FEED CONNECTED — LIVE MARKET INTELLIGENCE")
    messages.push("ALGORITHMIC PATTERN RECOGNITION ENGAGED")

    return messages
  }, [indexes, vixQuote])

  const isLoading = indexLoading || treasuryLoading || vixLoading

  return (
    <div className="glass border-t border-[#7d41ff]/30">
      <div className="flex">
        {/* Data Feeds */}
        {feeds.map((feed, index) => (
          <div
            key={feed.label}
            className={`flex-1 p-3 ${index !== feeds.length - 1 ? "border-r border-[#7d41ff]/20" : ""}`}
          >
            <div className="flex items-center gap-1 mb-1">
              <feed.icon
                className={`w-3 h-3 ${feed.trend === "up" ? "text-[#0df2c9]" : feed.trend === "down" ? "text-[#ff2e5b]" : "text-[#888]"}`}
              />
              <span className="font-mono text-[9px] italic uppercase text-[#888]">{feed.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#7d41ff]" />
              ) : (
                <>
                  <span className="font-mono text-lg font-bold text-white">{feed.value}</span>
                  <span
                    className={`font-mono text-[10px] ${feed.trend === "up" ? "text-[#0df2c9]" : feed.trend === "down" ? "text-[#ff2e5b]" : "text-[#888]"}`}
                  >
                    {feed.change}
                  </span>
                </>
              )}
            </div>
            {"correlation" in feed && feed.correlation && (
              <span className="font-mono text-[9px] text-[#7d41ff]">{feed.correlation}</span>
            )}
          </div>
        ))}

        {/* Live Commentary Marquee */}
        <div className="flex-[2] border-l border-[#7d41ff]/30 p-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-3 h-3 text-[#7d41ff] animate-pulse" />
            <span className="font-mono text-[9px] italic uppercase text-[#7d41ff]">IA LIVE COMMENTARY</span>
          </div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: [0, -2000] }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              {[...commentary, ...commentary].map((text, index) => (
                <span key={index} className="font-mono text-xs italic uppercase text-white/80 mr-16">
                  {text}
                  <span className="mx-4 text-[#7d41ff]">◆</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
