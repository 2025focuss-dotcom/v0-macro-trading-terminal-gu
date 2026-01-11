"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { WhatHappenedHUD } from "./what-happened-hud"
import { useIntradayChart, useQuote } from "@/hooks/use-market-data"
import { useMemo } from "react"

export function ChartArea() {
  const { candles: rawCandles, isLoading } = useIntradayChart("SPY", "5min")
  const { quote } = useQuote("SPY")

  const candles = useMemo(() => {
    if (!rawCandles || !Array.isArray(rawCandles) || rawCandles.length === 0) return []
    return rawCandles
      .slice(0, 50)
      .reverse()
      .map((c: any) => ({
        open: c.open,
        close: c.close,
        high: c.high,
        low: c.low,
        bullish: c.close > c.open,
      }))
  }, [rawCandles])

  // Calculate price range
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 }
    const min = Math.min(...candles.map((c) => c.low)) - 5
    const max = Math.max(...candles.map((c) => c.high)) + 5
    return { minPrice: min, maxPrice: max, priceRange: max - min }
  }, [candles])

  const scaleY = (price: number) => ((maxPrice - price) / priceRange) * 100

  // Generate price labels
  const priceLabels = useMemo(() => {
    if (priceRange === 100) return [100, 80, 60, 40, 20]
    const step = priceRange / 4
    return Array.from({ length: 5 }, (_, i) => maxPrice - step * i)
  }, [maxPrice, priceRange])

  // Determine liquidity zones based on price action
  const liquidityZones = useMemo(() => {
    if (candles.length === 0) return []
    const avgPrice = candles.reduce((sum, c) => sum + (c.high + c.low) / 2, 0) / candles.length
    const range = priceRange * 0.1
    return [
      { top: avgPrice + range, bottom: avgPrice, label: "INSTITUTIONAL LIQUIDITY" },
      { top: avgPrice + range * 2, bottom: avgPrice + range, label: "RESISTANCE ZONE" },
    ]
  }, [candles, priceRange])

  if (isLoading) {
    return (
      <div className="relative h-full glass overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#7d41ff]" />
          <span className="font-mono text-xs italic uppercase text-[#888]">LOADING CHART DATA...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full glass overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-[#7d41ff]/50" style={{ top: `${i * 10}%` }} />
        ))}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute h-full w-px bg-[#7d41ff]/30" style={{ left: `${i * 5}%` }} />
        ))}
      </div>

      {liquidityZones.map((zone, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 - idx * 0.1 }}
          transition={{ duration: 1, delay: idx * 0.3 }}
          className="absolute left-[20%] right-[40%] bg-[#7d41ff]/30 border border-[#7d41ff]/50"
          style={{
            top: `${scaleY(zone.top)}%`,
            height: `${((zone.top - zone.bottom) / priceRange) * 100}%`,
          }}
        >
          <div className="absolute -top-5 left-2 font-mono text-[9px] italic uppercase text-[#7d41ff]">
            {zone.label}
          </div>
          {idx === 0 && (
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-[#7d41ff]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}
        </motion.div>
      ))}

      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {candles.map((candle, i) => {
          const x = (i / candles.length) * 100
          const wickX = x + 0.8
          const bodyWidth = 1.4

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={`${wickX}%`}
                y1={`${scaleY(candle.high)}%`}
                x2={`${wickX}%`}
                y2={`${scaleY(candle.low)}%`}
                stroke={candle.bullish ? "#0df2c9" : "#ff2e5b"}
                strokeWidth="1"
              />
              {/* Body */}
              <motion.rect
                initial={{ height: 0 }}
                animate={{ height: `${Math.abs(scaleY(candle.open) - scaleY(candle.close))}%` }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                x={`${x + 0.1}%`}
                y={`${Math.min(scaleY(candle.open), scaleY(candle.close))}%`}
                width={`${bodyWidth}%`}
                fill={candle.bullish ? "#0df2c9" : "#ff2e5b"}
                opacity={0.9}
              />
            </g>
          )
        })}
      </svg>

      {quote && candles.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="absolute bottom-[25%] right-[25%] z-10"
        >
          <div className={`px-3 py-2 ${quote.changesPercentage >= 0 ? "bg-[#0df2c9] glow-green" : "bg-[#ff2e5b]"}`}>
            <span className="font-sans text-xs font-black italic uppercase text-black">
              {quote.changesPercentage >= 0 ? "STRONG BUY ZONE" : "CAUTION ZONE"}
            </span>
          </div>
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              quote.changesPercentage >= 0 ? "border-t-[#0df2c9]" : "border-t-[#ff2e5b]"
            }`}
          />
        </motion.div>
      )}

      {/* Price Labels */}
      <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between py-2 bg-black/50">
        {priceLabels.map((price) => (
          <span key={price} className="font-mono text-[9px] text-[#888] text-right pr-2">
            {price.toFixed(2)}
          </span>
        ))}
      </div>

      {/* What Happened HUD */}
      <WhatHappenedHUD />

      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7d41ff] to-transparent opacity-50"
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    </div>
  )
}
