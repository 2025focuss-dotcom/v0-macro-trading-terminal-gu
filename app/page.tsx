import { InstitutionalHeader } from "@/components/institutional-header"
import { ChartArea } from "@/components/chart-area"
import { TacticalPlaybook } from "@/components/tactical-playbook"
import { RetailVsSmart } from "@/components/retail-vs-smart"
import { NeuralBiasFeed } from "@/components/neural-bias-feed"
import { MacroBottomStrip } from "@/components/macro-bottom-strip"

export default function MacroCommandCenter() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <InstitutionalHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tactical Playbook */}
        <div className="w-64 flex-shrink-0 border-r border-[#7d41ff]/20">
          <TacticalPlaybook />
        </div>

        {/* Center - Chart Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <ChartArea />
          </div>

          {/* Bottom panels */}
          <div className="h-48 flex border-t border-[#7d41ff]/20">
            <div className="flex-1 border-r border-[#7d41ff]/20">
              <RetailVsSmart />
            </div>
            <div className="flex-1">
              <NeuralBiasFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <MacroBottomStrip />
    </div>
  )
}
