"use client"

import { motion } from "framer-motion"
import { Brain, CheckSquare, Square, Zap, Loader2 } from "lucide-react"
import { useSectorPerformance, useFearGreedIndex, useMarketMovers } from "@/hooks/use-market-data"
import { useMemo } from "react"

export function NeuralBiasFeed() {
  const { sectors, isLoading: sectorsLoading } = useSectorPerformance()
  const { fearGreed, isLoading: fearLoading } = useFearGreedIndex()
  const { gainers, losers, isLoading: moversLoading } = useMarketMovers()

  // Generate signals based on real market data
  const signals = useMemo(() => {
    const result = []

    // Fear/Greed signal
    if (fearGreed) {
      const value = fearGreed.value
      result.push({
        label: value <= 40 ? "FEAR SIGNAL ACTIVE" : value >= 60 ? "GREED SIGNAL ACTIVE" : "NEUTRAL SENTIMENT",
        checked: value <= 40 || value >= 60,
        confidence: Math.abs(value - 50) * 2,
      })
    }

    // Sector momentum
    if (sectors && sectors.length > 0) {
      const bullishSectors = sectors.filter((s: any) => Number.parseFloat(s.changesPercentage) > 0).length
      const sectorRatio = (bullishSectors / sectors.length) * 100
      result.push({
        label: "SECTOR BREADTH",
        checked: sectorRatio > 50,
        confidence: Math.round(sectorRatio),
      })
    }

    // Market movers analysis
    if (gainers && losers) {
      const avgGain = gainers.slice(0, 5).reduce((sum: number, g: any) => sum + (g.changesPercentage || 0), 0) / 5
      const avgLoss =
        losers.slice(0, 5).reduce((sum: number, l: any) => sum + Math.abs(l.changesPercentage || 0), 0) / 5
      const momentum = avgGain > avgLoss
      result.push({
        label: "MOMENTUM BIAS",
        checked: momentum,
        confidence: Math.round((avgGain / (avgGain + avgLoss)) * 100) || 50,
      })
    }

    // Volume analysis (simulated based on market movers)
    if (gainers && gainers.length > 0) {
      const highVolume = gainers.some((g: any) => g.volume > g.avgVolume * 1.5)
      result.push({
        label: "VOLUME CONFIRMATION",
        checked: highVolume,
        confidence: highVolume ? 78 : 35,
      })
    }

    // Risk-off indicator
    result.push({
      label: "RISK-OFF SENTIMENT",
      checked: fearGreed?.value <= 40,
      confidence: fearGreed ? 100 - fearGreed.value : 50,
    })

    return result.length > 0 ? result : [{ label: "LOADING SIGNALS...", checked: false, confidence: 0 }]
  }, [fearGreed, sectors, gainers, losers])

  // Calculate aggregate bias
  const aggregateBias = useMemo(() => {
    if (signals.length === 0) return { label: "LOADING", value: 50 }
    const avgConfidence =
      signals.reduce((sum, s) => sum + (s.checked ? s.confidence : 100 - s.confidence), 0) / signals.length
    return {
      label: avgConfidence >= 60 ? "BULLISH" : avgConfidence <= 40 ? "BEARISH" : "NEUTRAL",
      value: Math.round(avgConfidence),
    }
  }, [signals])

  const isLoading = sectorsLoading || fearLoading || moversLoading

  return (
    <div className="glass p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-[#7d41ff]" />
        <span className="font-sans text-sm font-black italic uppercase tracking-tight">NEURAL SCAN</span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="ml-auto"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-[#7d41ff]" />
          ) : (
            <Zap className="w-3 h-3 text-[#0df2c9]" />
          )}
        </motion.div>
      </div>

      <div className="space-y-3">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            {signal.checked ? (
              <CheckSquare className="w-4 h-4 text-[#0df2c9] flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#888] flex-shrink-0" />
            )}
            <span
              className={`font-mono text-[10px] italic uppercase flex-1 ${
                signal.checked ? "text-white" : "text-[#888]"
              }`}
            >
              {signal.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 bg-black/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.confidence}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className={`h-full ${signal.confidence > 70 ? "bg-[#0df2c9]" : signal.confidence > 40 ? "bg-[#7d41ff]" : "bg-[#888]"}`}
                />
              </div>
              <span
                className={`font-mono text-[9px] ${signal.confidence > 70 ? "text-[#0df2c9]" : signal.confidence > 40 ? "text-[#7d41ff]" : "text-[#888]"}`}
              >
                {signal.confidence}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className={`mt-4 p-3 border ${aggregateBias.label === "BULLISH" ? "border-[#0df2c9]/30 bg-[#0df2c9]/5" : aggregateBias.label === "BEARISH" ? "border-[#ff2e5b]/30 bg-[#ff2e5b]/5" : "border-[#7d41ff]/30 bg-[#7d41ff]/5"}`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] italic uppercase text-[#888]">AGGREGATE BIAS</span>
          <span
            className={`font-sans text-sm font-black italic uppercase ${aggregateBias.label === "BULLISH" ? "text-[#0df2c9]" : aggregateBias.label === "BEARISH" ? "text-[#ff2e5b]" : "text-[#7d41ff]"}`}
          >
            {aggregateBias.label} {aggregateBias.value}%
          </span>
        </div>
      </div>
    </div>
  )
}
