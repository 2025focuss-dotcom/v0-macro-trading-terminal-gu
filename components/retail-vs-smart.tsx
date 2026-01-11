"use client"

import { motion } from "framer-motion"
import { Users, Brain, Loader2 } from "lucide-react"
import { useFearGreedIndex, useMarketMovers } from "@/hooks/use-market-data"
import { useMemo } from "react"

export function RetailVsSmart() {
  const { fearGreed, isLoading: fearLoading } = useFearGreedIndex()
  const { gainers, losers, isLoading: moversLoading } = useMarketMovers()

  // Simulate retail sentiment from fear/greed (inverted - retail often wrong at extremes)
  const retailData = useMemo(() => {
    if (!fearGreed) return { shorts: 50, label: "LOADING" }

    // When fear is high, retail tends to be short (inversely related to smart money)
    const fearValue = fearGreed.value
    const retailShorts = Math.round(100 - fearValue) // Inverse of fear/greed

    return {
      shorts: Math.min(95, Math.max(5, retailShorts)),
      label: retailShorts > 60 ? "RETAIL SHORTS" : retailShorts < 40 ? "RETAIL LONGS" : "RETAIL NEUTRAL",
    }
  }, [fearGreed])

  // Simulate IA/Smart money bias from market momentum
  const smartMoneyData = useMemo(() => {
    if (!gainers || !losers) return { bias: 50, label: "LOADING" }

    // Smart money follows momentum with volume confirmation
    const totalGainerVolume = gainers.slice(0, 10).reduce((sum: number, g: any) => sum + (g.volume || 0), 0)
    const totalLoserVolume = losers.slice(0, 10).reduce((sum: number, l: any) => sum + (l.volume || 0), 0)

    const bullishBias = (totalGainerVolume / (totalGainerVolume + totalLoserVolume)) * 100

    return {
      bias: Math.round(bullishBias),
      label: bullishBias > 55 ? "BULLISH" : bullishBias < 45 ? "BEARISH" : "NEUTRAL",
    }
  }, [gainers, losers])

  // Divergence calculation
  const divergence = useMemo(() => {
    const retailBullish = 100 - retailData.shorts // If shorts high, bullish low
    const smartBullish = smartMoneyData.bias
    const diff = smartBullish - retailBullish

    if (Math.abs(diff) > 30) {
      return {
        signal: diff > 0 ? "STRONG CONTRARIAN BUY" : "STRONG CONTRARIAN SELL",
        color: diff > 0 ? "#0df2c9" : "#ff2e5b",
      }
    } else if (Math.abs(diff) > 15) {
      return {
        signal: diff > 0 ? "MILD BULLISH DIVERGENCE" : "MILD BEARISH DIVERGENCE",
        color: "#7d41ff",
      }
    }
    return {
      signal: "NO SIGNIFICANT DIVERGENCE",
      color: "#888",
    }
  }, [retailData, smartMoneyData])

  const isLoading = fearLoading || moversLoading

  return (
    <div className="glass p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-sans text-sm font-black italic uppercase tracking-tight">RETAIL VS SMART MONEY</span>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#7d41ff] ml-auto" />}
      </div>

      <div className="space-y-4">
        {/* Retail Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-[#ff2e5b]" />
              <span className="font-mono text-[10px] italic uppercase text-[#888]">{retailData.label}</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff2e5b]">{retailData.shorts}%</span>
          </div>
          <div className="h-6 bg-black/50 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${retailData.shorts}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#ff2e5b] to-[#ff2e5b]/70 relative"
              style={{ boxShadow: "0 0 20px rgba(255, 46, 91, 0.6)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 w-1 bg-white/30"
              animate={{ left: ["0%", `${retailData.shorts}%`] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
        </div>

        {/* IA Bias Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-3 h-3 text-[#0df2c9]" />
              <span className="font-mono text-[10px] italic uppercase text-[#888]">IA BIAS</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#0df2c9]">{smartMoneyData.label}</span>
          </div>
          <div className="h-6 bg-black/50 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${smartMoneyData.bias}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#0df2c9] to-[#0df2c9]/70 relative"
              style={{ boxShadow: "0 0 20px rgba(13, 242, 201, 0.6)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 w-1 bg-white/30"
              animate={{ left: ["0%", `${smartMoneyData.bias}%`] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 0.5 }}
            />
          </div>
        </div>

        {/* Divergence Indicator */}
        <div className="mt-4 p-3 border border-[#7d41ff]/50 bg-[#7d41ff]/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] italic uppercase text-[#888]">DIVERGENCE SIGNAL</span>
            <motion.span
              className="font-sans text-xs font-black italic uppercase"
              style={{ color: divergence.color }}
              animate={divergence.color === "#0df2c9" || divergence.color === "#ff2e5b" ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              {divergence.signal}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}
