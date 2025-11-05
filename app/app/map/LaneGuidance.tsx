'use client'

import { ArrowUp, ArrowUpLeft, ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import type { LaneInfo } from '@/lib/types'

interface LaneGuidanceProps {
  lanes: LaneInfo[]
}

const getLaneIcon = (indications: string[]) => {
  const indication = indications[0]?.toLowerCase() || 'straight'
  
  const iconClass = "w-5 h-5"
  
  if (indication.includes('left')) {
    return <ArrowUpLeft className={iconClass} />
  }
  if (indication.includes('right')) {
    return <ArrowUpRight className={iconClass} />
  }
  if (indication.includes('slight left')) {
    return <ArrowUpLeft className={iconClass} />
  }
  if (indication.includes('slight right')) {
    return <ArrowUpRight className={iconClass} />
  }
  if (indication.includes('sharp left')) {
    return <ArrowLeft className={iconClass} />
  }
  if (indication.includes('sharp right')) {
    return <ArrowRight className={iconClass} />
  }
  
  return <ArrowUp className={iconClass} />
}

export default function LaneGuidance({ lanes }: LaneGuidanceProps) {
  if (!lanes || lanes.length === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-1.5 bg-[#0C0C0C]/95 backdrop-blur-sm px-4 py-2 rounded-2xl border border-[#262626]">
      {lanes.map((lane, index) => (
        <div
          key={index}
          className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg border-2 transition-all ${
            lane.valid && lane.active
              ? 'border-[#84CC16] bg-[#84CC16]/20'
              : lane.valid
              ? 'border-[#FAFAFA] bg-[#262626]'
              : 'border-[#525252] bg-[#171717] opacity-50'
          }`}
        >
          <div
            className={`${
              lane.valid && lane.active
                ? 'text-[#84CC16]'
                : lane.valid
                ? 'text-[#FAFAFA]'
                : 'text-[#525252]'
            }`}
          >
            {getLaneIcon(lane.indications)}
          </div>
          {lane.indications.length > 1 && (
            <div className="text-[8px] text-[#A3A3A3] mt-0.5">
              +{lane.indications.length - 1}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
