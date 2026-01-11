import { InstitutionalHeader } from "@/components/institutional-header"
import { ChartArea } from "@/components/chart-area"
import { ScenarioPlaybook } from "@/components/scenario-playbook"
import { InstitutionalCalendar } from "@/components/institutional-calendar"
import { NeuralSentimentAggregator } from "@/components/neural-sentiment-aggregator"
import { LiveMarketHeadlines } from "@/components/live-market-headlines"
import { MacroBottomStrip } from "@/components/macro-bottom-strip"

export default function MacroCommandCenter() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Calendar & Sentiment */}
        <div className="w-80 flex-shrink-0 border-r border-[#7d41ff]/20 flex flex-col">
          <div className="flex-1 border-b border-[#7d41ff]/20">
            <InstitutionalCalendar />
          </div>
          <div className="h-[45%]">
            <NeuralSentimentAggregator />
          </div>
        </div>

        {/* Center - Chart & Scenario Playbook */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <ChartArea />
          </div>
          <div className="h-72 border-t border-[#7d41ff]/20">
            <ScenarioPlaybook />
          </div>
        </div>

        {/* Right Sidebar - Live Headlines */}
        <div className="w-80 flex-shrink-0 border-l border-[#7d41ff]/20">
          <LiveMarketHeadlines />
        </div>
      </div>

      {/* Bottom Strip */}
      <MacroBottomStrip />
    </div>
  )
}
