"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { WhatHappenedHUD } from "./what-happened-hud"

export function ChartArea() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ""

    // Create container div for widget
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"
    widgetContainer.style.position = "relative"

    const widgetInner = document.createElement("div")
    widgetInner.className = "tradingview-widget-container__widget"
    widgetInner.style.height = "100%"
    widgetInner.style.width = "100%"

    widgetContainer.appendChild(widgetInner)

    // Create script element for TradingView widget
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "OANDA:XAUUSD",
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "es",
      backgroundColor: "rgba(0, 0, 0, 1)",
      gridColor: "rgba(125, 65, 255, 0.1)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: ["STD;SMA", "STD;RSI"],
    })

    widgetContainer.appendChild(script)
    containerRef.current.appendChild(widgetContainer)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div className="relative h-full w-full glass overflow-hidden" style={{ minHeight: "400px" }}>
      {/* TradingView Chart Container with explicit sizing */}
      <div ref={containerRef} className="absolute inset-0 z-0" style={{ height: "100%", width: "100%" }} />

      {/* Institutional Liquidity Overlay Label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-4 left-4 z-10 pointer-events-none"
      >
        <div className="px-2 py-1 bg-[#7d41ff]/20 border border-[#7d41ff]/50 backdrop-blur-sm">
          <span className="font-mono text-[9px] italic uppercase text-[#7d41ff]">XAUUSD • INSTITUTIONAL FLOW</span>
        </div>
      </motion.div>

      {/* Strong Buy Zone Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="absolute bottom-[20%] right-[10%] z-10 pointer-events-none"
      >
        <div className="px-3 py-2 bg-[#0df2c9] glow-green">
          <span className="font-sans text-xs font-black italic uppercase text-black">ZONA DE COMPRA FUERTE</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0df2c9]" />
      </motion.div>

      {/* What Happened HUD */}
      <WhatHappenedHUD />

      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7d41ff] to-transparent opacity-30"
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    </div>
  )
}
