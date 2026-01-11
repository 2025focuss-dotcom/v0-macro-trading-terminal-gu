"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, AlertOctagon, Crosshair, Shield } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface LiquidityTarget {
  price: number
  type: "target" | "magnet" | "invalidation"
  label: string
  probability: number
}

interface Scenario {
  bias: "bullish" | "bearish"
  trigger: string
  condition: string
  targets: LiquidityTarget[]
  stopLoss: number
  riskReward: string
  confluence: string[]
  probability: number
}

const bullishScenario: Scenario = {
  bias: "bullish",
  trigger: "DOVISH FED / WEAK USD DATA",
  condition: "DXY < 108.00 & US10Y < 4.60%",
  targets: [
    { price: 2710, type: "target", label: "T1: ASIA HIGH", probability: 75 },
    { price: 2725, type: "target", label: "T2: WEEKLY VWAP", probability: 55 },
    { price: 2745, type: "magnet", label: "LIQUIDITY POOL", probability: 35 },
  ],
  stopLoss: 2678,
  riskReward: "1:3.2",
  confluence: ["DXY WEAKNESS", "YIELDS DOWN", "RISK-OFF FLOWS"],
  probability: 65,
}

const bearishScenario: Scenario = {
  bias: "bearish",
  trigger: "HAWKISH FED / STRONG USD DATA",
  condition: "DXY > 109.50 & US10Y > 4.75%",
  targets: [
    { price: 2665, type: "target", label: "T1: LONDON LOW", probability: 70 },
    { price: 2648, type: "target", label: "T2: DAILY DEMAND", probability: 50 },
    { price: 2620, type: "magnet", label: "SELL-SIDE LIQ", probability: 30 },
  ],
  stopLoss: 2698,
  riskReward: "1:2.8",
  confluence: ["DXY STRENGTH", "YIELDS UP", "RISK-ON FLOWS"],
  probability: 35,
}

// Sparkline data for momentum visualization
const bullishSparkline = [
  { v: 20 },
  { v: 25 },
  { v: 30 },
  { v: 28 },
  { v: 35 },
  { v: 42 },
  { v: 48 },
  { v: 55 },
  { v: 62 },
  { v: 70 },
]
const bearishSparkline = [
  { v: 70 },
  { v: 65 },
  { v: 58 },
  { v: 62 },
  { v: 55 },
  { v: 48 },
  { v: 42 },
  { v: 35 },
  { v: 28 },
  { v: 22 },
]

function ScenarioPane({ scenario, sparklineData }: { scenario: Scenario; sparklineData: typeof bullishSparkline }) {
  const isBullish = scenario.bias === "bullish"
  const accentColor = isBullish ? "#0df2c9" : "#ff2e5b"
  const bgColor = isBullish ? "bg-[#0df2c9]/5" : "bg-[#ff2e5b]/5"
  const borderColor = isBullish ? "border-[#0df2c9]" : "border-[#ff2e5b]"

  return (
    <div className={`flex-1 ${bgColor} border-l-4 ${borderColor} p-4 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBullish ? (
            <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <TrendingDown className="w-5 h-5" style={{ color: accentColor }} />
          )}
          <span className="font-sans text-sm font-black italic uppercase" style={{ color: accentColor }}>
            {isBullish ? "BULLISH" : "BEARISH"} SCENARIO
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-[#888]">PROB:</span>
          <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>
            {scenario.probability}%
          </span>
        </div>
      </div>

      {/* Trigger Condition */}
      <div className="mb-3 p-2 bg-black/50 border border-[#7d41ff]/20">
        <span className="font-mono text-[9px] text-[#888] block uppercase mb-1">TRIGGER CONDITION</span>
        <span className="font-sans text-xs font-bold italic uppercase text-white">{scenario.trigger}</span>
        <span className="font-mono text-[10px] text-[#7d41ff] block mt-1">{scenario.condition}</span>
      </div>

      {/* Momentum Sparkline */}
      <div className="h-12 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${scenario.bias}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={accentColor}
              strokeWidth={2}
              fill={`url(#gradient-${scenario.bias})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Liquidity Targets */}
      <div className="flex-1 space-y-2 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Crosshair className="w-3 h-3 text-[#7d41ff]" />
          <span className="font-mono text-[9px] text-[#888] uppercase">LIQUIDITY TARGETS</span>
        </div>
        {scenario.targets.map((target, index) => (
          <motion.div
            key={target.price}
            initial={{ opacity: 0, x: isBullish ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 bg-black/30"
          >
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" style={{ color: accentColor }} />
              <div>
                <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                  ${target.price}
                </span>
                <span className="font-mono text-[9px] text-[#888] block">{target.label}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-[#888]">{target.probability}%</span>
              <div className="w-16 h-1 bg-[#7d41ff]/20 mt-1">
                <div className="h-full" style={{ width: `${target.probability}%`, backgroundColor: accentColor }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stop Loss & Risk/Reward */}
      <div className="pt-3 border-t border-[#7d41ff]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-3 h-3 text-[#ff2e5b]" />
            <span className="font-mono text-[9px] text-[#888] uppercase">INVALIDATION</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#ff2e5b]">${scenario.stopLoss}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-[#7d41ff]" />
            <span className="font-mono text-[9px] text-[#888] uppercase">RISK/REWARD</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#7d41ff]">{scenario.riskReward}</span>
        </div>
      </div>

      {/* Confluence Factors */}
      <div className="mt-3 pt-3 border-t border-[#7d41ff]/20">
        <span className="font-mono text-[9px] text-[#888] block uppercase mb-2">CONFLUENCE FACTORS</span>
        <div className="flex flex-wrap gap-1">
          {scenario.confluence.map((factor) => (
            <span
              key={factor}
              className="px-2 py-0.5 font-mono text-[9px] uppercase"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {factor}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ScenarioPlaybook() {
  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#7d41ff]" />
          <span className="font-sans text-sm font-black italic uppercase tracking-tight">SCENARIO PLAYBOOK</span>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">XAUUSD EXECUTION GUIDE</span>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 flex">
        <ScenarioPane scenario={bullishScenario} sparklineData={bullishSparkline} />
        <div className="w-px bg-[#7d41ff]/30" />
        <ScenarioPane scenario={bearishScenario} sparklineData={bearishSparkline} />
      </div>
    </div>
  )
}
