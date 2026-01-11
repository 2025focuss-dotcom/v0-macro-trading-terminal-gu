"use client"

import { motion } from "framer-motion"
import { ChevronUp, Minus, ChevronDown, Target } from "lucide-react"

const scenarios = [
  {
    label: "ABOVE",
    icon: ChevronUp,
    color: "#0df2c9",
    borderColor: "border-[#0df2c9]",
    bgColor: "bg-[#0df2c9]/10",
    title: "NFP > 200K",
    action: "SCALP SHORT → 2680",
    probability: "25%",
  },
  {
    label: "FORECAST",
    icon: Minus,
    color: "#888",
    borderColor: "border-zinc-500",
    bgColor: "bg-zinc-500/10",
    title: "NFP 175-200K",
    action: "HOLD BIAS → WAIT",
    probability: "45%",
  },
  {
    label: "BELOW",
    icon: ChevronDown,
    color: "#ff2e5b",
    borderColor: "border-[#ff2e5b]",
    bgColor: "bg-[#ff2e5b]/10",
    title: "NFP < 175K",
    action: "AGGRESSIVE LONG → 2720",
    probability: "30%",
  },
]

export function TacticalPlaybook() {
  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#7d41ff]" />
          <span className="font-sans text-sm font-black italic uppercase tracking-tight">TACTICAL PLAYBOOK</span>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">NFP RELEASE SCENARIOS</span>
      </div>

      <div className="flex-1 p-3 space-y-3">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`p-3 border-l-4 ${scenario.borderColor} ${scenario.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <scenario.icon className="w-4 h-4" style={{ color: scenario.color }} />
                <span className="font-sans text-xs font-black italic uppercase" style={{ color: scenario.color }}>
                  {scenario.label}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#888]">{scenario.probability}</span>
            </div>
            <div className="font-mono text-[10px] italic uppercase text-white/80 mb-1">{scenario.title}</div>
            <div className="font-mono text-xs font-bold italic uppercase" style={{ color: scenario.color }}>
              {scenario.action}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
