"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, AlertTriangle, Building2 } from "lucide-react"
import useSWR from "swr"

interface EconomicEvent {
  id: string
  event: string
  date: string
  time: string
  currency: string
  impact: "high" | "medium" | "low"
  forecast: number | null
  previous: number | null
  actual: number | null
  bankConsensus: {
    gs: number | null // Goldman Sachs
    jpm: number | null // JP Morgan
    ms: number | null // Morgan Stanley
  }
  stdDev: number
}

// Calculate deviation score
function calculateDeviationScore(
  actual: number | null,
  forecast: number | null,
  stdDev: number,
): { score: number; isShock: boolean } {
  if (actual === null || forecast === null) return { score: 0, isShock: false }
  const deviation = Math.abs(actual - forecast)
  const score = deviation / stdDev
  return { score, isShock: score > 1 }
}

// Get consensus range from bank estimates
function getConsensusRange(consensus: EconomicEvent["bankConsensus"]): { min: number; max: number } | null {
  const values = [consensus.gs, consensus.jpm, consensus.ms].filter((v): v is number => v !== null)
  if (values.length === 0) return null
  return { min: Math.min(...values), max: Math.max(...values) }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InstitutionalCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const { data: calendarData } = useSWR<EconomicEvent[]>("/api/market/calendar", fetcher, {
    refreshInterval: 60000,
    fallbackData: [
      {
        id: "nfp",
        event: "NON-FARM PAYROLLS",
        date: "2024-01-10",
        time: "13:30 GMT",
        currency: "USD",
        impact: "high",
        forecast: 180,
        previous: 227,
        actual: 256,
        bankConsensus: { gs: 175, jpm: 185, ms: 190 },
        stdDev: 35,
      },
      {
        id: "cpi",
        event: "CPI YoY",
        date: "2024-01-15",
        time: "13:30 GMT",
        currency: "USD",
        impact: "high",
        forecast: 2.9,
        previous: 2.7,
        actual: null,
        bankConsensus: { gs: 2.8, jpm: 2.9, ms: 3.0 },
        stdDev: 0.2,
      },
      {
        id: "fomc",
        event: "FOMC RATE DECISION",
        date: "2024-01-29",
        time: "19:00 GMT",
        currency: "USD",
        impact: "high",
        forecast: 4.5,
        previous: 4.5,
        actual: null,
        bankConsensus: { gs: 4.5, jpm: 4.5, ms: 4.5 },
        stdDev: 0.25,
      },
      {
        id: "pmi",
        event: "ISM MANUFACTURING PMI",
        date: "2024-01-02",
        time: "15:00 GMT",
        currency: "USD",
        impact: "medium",
        forecast: 48.2,
        previous: 48.4,
        actual: 49.3,
        bankConsensus: { gs: 48.0, jpm: 48.5, ms: 48.1 },
        stdDev: 1.5,
      },
      {
        id: "jobless",
        event: "INITIAL JOBLESS CLAIMS",
        date: "2024-01-09",
        time: "13:30 GMT",
        currency: "USD",
        impact: "medium",
        forecast: 210,
        previous: 211,
        actual: 201,
        bankConsensus: { gs: 208, jpm: 212, ms: 215 },
        stdDev: 12,
      },
    ],
  })

  return (
    <div className="glass h-full flex flex-col">
      <div className="p-4 border-b border-[#7d41ff]/30">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#7d41ff]" />
          <span className="font-sans text-sm font-black italic uppercase tracking-tight">INSTITUTIONAL CALENDAR</span>
        </div>
        <span className="font-mono text-[10px] italic uppercase text-[#888] mt-1 block">
          BANK CONSENSUS & DEVIATIONS
        </span>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {calendarData?.map((event, index) => {
          const deviation = calculateDeviationScore(event.actual, event.forecast, event.stdDev)
          const consensusRange = getConsensusRange(event.bankConsensus)
          const isSelected = selectedEvent === event.id

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEvent(isSelected ? null : event.id)}
              className={`relative p-3 cursor-pointer transition-all duration-200 ${
                deviation.isShock
                  ? "border border-[#ff2e5b] bg-[#ff2e5b]/10"
                  : "border border-[#7d41ff]/20 bg-[#7d41ff]/5 hover:border-[#7d41ff]/40"
              }`}
            >
              {/* Market Shock Alert */}
              <AnimatePresence>
                {deviation.isShock && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-[#ff2e5b] text-black"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-mono text-[9px] font-black uppercase">MARKET SHOCK</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Event Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 ${
                      event.impact === "high"
                        ? "bg-[#ff2e5b]"
                        : event.impact === "medium"
                          ? "bg-[#f7931a]"
                          : "bg-[#888]"
                    }`}
                  />
                  <span className="font-sans text-xs font-black italic uppercase text-white">{event.event}</span>
                </div>
                <span className="font-mono text-[9px] text-[#888]">{event.time}</span>
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <span className="font-mono text-[8px] text-[#888] block uppercase">FORECAST</span>
                  <span className="font-mono text-xs text-white">{event.forecast ?? "—"}</span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#888] block uppercase">ACTUAL</span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      event.actual !== null
                        ? event.actual > (event.forecast ?? 0)
                          ? "text-[#0df2c9]"
                          : "text-[#ff2e5b]"
                        : "text-[#888]"
                    }`}
                  >
                    {event.actual ?? "PENDING"}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#888] block uppercase">PREVIOUS</span>
                  <span className="font-mono text-xs text-white/70">{event.previous ?? "—"}</span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-[#888] block uppercase">DEV SCORE</span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      deviation.score > 1
                        ? "text-[#ff2e5b]"
                        : deviation.score > 0.5
                          ? "text-[#f7931a]"
                          : "text-[#0df2c9]"
                    }`}
                  >
                    {event.actual !== null ? deviation.score.toFixed(2) + "σ" : "—"}
                  </span>
                </div>
              </div>

              {/* Bank Consensus Range */}
              {consensusRange && (
                <div className="pt-2 border-t border-[#7d41ff]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[8px] text-[#888] uppercase">BANK CONSENSUS RANGE</span>
                    <span className="font-mono text-[10px] text-[#7d41ff]">
                      {consensusRange.min} — {consensusRange.max}
                    </span>
                  </div>

                  {/* Expanded Bank Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1"
                      >
                        {[
                          { name: "GOLDMAN SACHS", value: event.bankConsensus.gs, color: "#f7931a" },
                          { name: "JP MORGAN", value: event.bankConsensus.jpm, color: "#0df2c9" },
                          { name: "MORGAN STANLEY", value: event.bankConsensus.ms, color: "#7d41ff" },
                        ].map((bank) => (
                          <div key={bank.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3 h-3" style={{ color: bank.color }} />
                              <span className="font-mono text-[9px] text-[#888]">{bank.name}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold" style={{ color: bank.color }}>
                              {bank.value ?? "—"}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
