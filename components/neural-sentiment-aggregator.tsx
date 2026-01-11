"use client"
import { motion } from "framer-motion"
import { Brain, TrendingUp, TrendingDown, Minus, Zap, Activity } from "lucide-react"
import useSWR from "swr"

interface CorrelationData {
  asset: string
  value: number
  change: number
  correlation: "positive" | "negative" | "neutral"
}

interface CurrencyStrength {
  currency: string
  strength: number
  trend: "up" | "down" | "neutral"
}

interface ConfluenceSignal {
  level: number
  signal: string
  factors: string[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function calculateConfluence(dxy: CorrelationData, us10y: CorrelationData): ConfluenceSignal {
  const dxyDown = dxy.change < 0
  const yieldsDown = us10y.change < 0

  if (dxyDown && yieldsDown) {
    return {
      level: 95,
      signal: "STRONG BUY",
      factors: ["DXY WEAKNESS", "YIELDS COMPRESSION", "GOLD TAILWIND"],
    }
  } else if (!dxyDown && !yieldsDown) {
    return {
      level: 85,
      signal: "STRONG SELL",
      factors: ["DXY STRENGTH", "YIELDS RISING", "GOLD HEADWIND"],
    }
  } else if (dxyDown && !yieldsDown) {
    return {
      level: 60,
      signal: "MODERATE BUY",
      factors: ["MIXED SIGNALS", "DXY SUPPORTIVE", "YIELDS NEUTRAL"],
    }
  } else {
    return {
      level: 45,
      signal: "CAUTION",
      factors: ["CONFLICTING DATA", "WAIT FOR CLARITY"],
    }
  }
}

export function NeuralSentimentAggregator() {
  const { data: indexData } = useSWR("/api/market/indexes", fetcher, {
    refreshInterval: 30000,
  })

  // Extract DXY and US10Y from index data or use defaults
  const correlations: CorrelationData[] = [
    {
      asset: "DXY",
      value: indexData?.find((i: { symbol: string }) => i.symbol === "DX-Y.NYB")?.price ?? 109.18,
      change: indexData?.find((i: { symbol: string }) => i.symbol === "DX-Y.NYB")?.changesPercentage ?? -0.34,
      correlation: "negative",
    },
    {
      asset: "US10Y",
      value: 4.68,
      change: -0.12,
      correlation: "negative",
    },
    {
      asset: "VIX",
      value: indexData?.find((i: { symbol: string }) => i.symbol === "^VIX")?.price ?? 17.82,
      change: indexData?.find((i: { symbol: string }) => i.symbol === "^VIX")?.changesPercentage ?? 2.45,
      correlation: "positive",
    },
  ]

  const currencyStrengths: CurrencyStrength[] = [
    { currency: "USD", strength: 72, trend: "down" },
    { currency: "EUR", strength: 48, trend: "up" },
    { currency: "JPY", strength: 35, trend: "down" },
    { currency: "GBP", strength: 52, trend: "neutral" },
    { currency: "CHF", strength: 58, trend: "up" },
    { currency: "AUD", strength: 41, trend: "down" },
  ]

  const dxy = correlations.find((c) => c.asset === "DXY")!
  const us10y = correlations.find((c) => c.asset === "US10Y")!
  const confluence = calculateConfluence(dxy, us10y)

  const isBullish = confluence.signal.includes("BUY")
  const signalColor = isBullish ? "#0df2c9" : confluence.signal === "CAUTION" ? "#f7931a" : "#ff2e5b"

  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#7d41ff]" />
          <span className="font-sans text-sm font-black italic uppercase tracking-tight">NEURAL SENTIMENT</span>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">XAUUSD CORRELATION MATRIX</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Confluence Signal - Main Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 border-2"
          style={{ borderColor: signalColor, backgroundColor: `${signalColor}10` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: signalColor }} />
              <span className="font-mono text-[10px] text-[#888] uppercase">CONFLUENCE LEVEL</span>
            </div>
            <span className="font-mono text-2xl font-black" style={{ color: signalColor }}>
              {confluence.level}%
            </span>
          </div>

          <div className="text-center mb-3">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="font-sans text-xl font-black italic uppercase"
              style={{ color: signalColor }}
            >
              {confluence.signal}
            </motion.span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-black/50 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confluence.level}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full"
              style={{ backgroundColor: signalColor }}
            />
          </div>

          {/* Factors */}
          <div className="flex flex-wrap gap-1 justify-center">
            {confluence.factors.map((factor) => (
              <span
                key={factor}
                className="px-2 py-0.5 font-mono text-[9px] uppercase bg-black/30"
                style={{ color: signalColor }}
              >
                {factor}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Correlation Matrix */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 text-[#7d41ff]" />
            <span className="font-mono text-[9px] text-[#888] uppercase">ASSET CORRELATIONS</span>
          </div>
          <div className="space-y-2">
            {correlations.map((item, index) => {
              const isPositive = item.change > 0
              const changeColor = isPositive ? "#0df2c9" : "#ff2e5b"
              const correlationImpact =
                item.correlation === "negative"
                  ? item.change < 0
                    ? "BULLISH XAU"
                    : "BEARISH XAU"
                  : item.change > 0
                    ? "BULLISH XAU"
                    : "BEARISH XAU"

              return (
                <motion.div
                  key={item.asset}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-[#7d41ff]/5 border border-[#7d41ff]/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs font-bold uppercase text-white w-12">{item.asset}</span>
                    <span className="font-mono text-sm text-white">{item.value.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" style={{ color: changeColor }} />
                      ) : (
                        <TrendingDown className="w-3 h-3" style={{ color: changeColor }} />
                      )}
                      <span className="font-mono text-xs font-bold" style={{ color: changeColor }}>
                        {isPositive ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 font-mono text-[8px] uppercase ${
                        correlationImpact.includes("BULLISH")
                          ? "bg-[#0df2c9]/20 text-[#0df2c9]"
                          : "bg-[#ff2e5b]/20 text-[#ff2e5b]"
                      }`}
                    >
                      {correlationImpact}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Currency Strength Heat Meter */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 text-[#7d41ff]" />
            <span className="font-mono text-[9px] text-[#888] uppercase">CURRENCY STRENGTH INDEX</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {currencyStrengths.map((currency, index) => {
              const heatColor = currency.strength > 60 ? "#0df2c9" : currency.strength > 40 ? "#f7931a" : "#ff2e5b"

              return (
                <motion.div
                  key={currency.currency}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-2 bg-black/30 border border-[#7d41ff]/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-white">{currency.currency}</span>
                    {currency.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-[#0df2c9]" />
                    ) : currency.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 text-[#ff2e5b]" />
                    ) : (
                      <Minus className="w-3 h-3 text-[#888]" />
                    )}
                  </div>
                  <div className="h-1.5 bg-[#7d41ff]/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currency.strength}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full"
                      style={{ backgroundColor: heatColor }}
                    />
                  </div>
                  <span className="font-mono text-[9px] mt-1 block" style={{ color: heatColor }}>
                    {currency.strength}%
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
