"use client"

import { motion } from "framer-motion"
import { Zap, TrendingUp, DollarSign, Building2 } from "lucide-react"

const drivers = [
  { icon: Zap, text: "FED CUTS 25BPS — DOVISH PIVOT CONFIRMED", type: "bullish" },
  { icon: DollarSign, text: "DXY WEAKNESS — DOLLAR INDEX -0.94%", type: "bullish" },
  { icon: Building2, text: "CENTRAL BANKS NET BUYERS Q4 +42T", type: "bullish" },
  { icon: TrendingUp, text: "REAL YIELDS COMPRESSING — 10Y TIPS -12BPS", type: "neutral" },
]

export function WhatHappenedHUD() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 left-4 z-20 glass glow-purple max-w-xs"
    >
      {/* Purple accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7d41ff]" />

      <div className="p-4 pl-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-sans text-sm font-black italic uppercase tracking-tight text-[#7d41ff]">
            WHAT HAPPENED?
          </span>
          <div className="h-px flex-1 bg-[#7d41ff]/30" />
        </div>

        <div className="space-y-2">
          {drivers.map((driver, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2"
            >
              <driver.icon
                className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                  driver.type === "bullish" ? "text-[#0df2c9]" : "text-[#888]"
                }`}
              />
              <span className="font-mono text-[10px] italic uppercase leading-tight text-white/90">{driver.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
