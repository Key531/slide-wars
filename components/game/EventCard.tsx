'use client'

import { useState } from 'react'
import type { GameEvent } from '@/types/game'

const URGENCY_CONFIG = {
  critical: { label: '🚨 CRITICAL', cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
  high:     { label: '⚡ URGENT',   cls: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  medium:   { label: '📋 NORMAL',   cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  low:      { label: '💬 INFO',     cls: 'bg-gray-500/20 text-gray-400 border-gray-500/40' },
}

interface Props {
  event: GameEvent
  onChoice: (idx: number) => void
  disabled?: boolean
}

export function EventCard({ event, onChoice, disabled = false }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const cfg = URGENCY_CONFIG[event.urgency]

  const handleChoice = (idx: number) => {
    if (disabled || selected !== null) return
    setSelected(idx)
    onChoice(idx)
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-white/10 bg-[#1a1f2e] shadow-2xl">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-[#141824] flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cfg.cls}`}>
          {cfg.label}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
            {event.npcName.charAt(0)}
          </div>
          <div className="text-right">
            <div className="text-white text-xs font-medium">{event.npcName}</div>
            <div className="text-gray-500 text-[10px]">{event.npcOrg}</div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4">
        <h2 className="text-white font-bold text-base mb-3 leading-snug">{event.title}</h2>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
      </div>

      {/* 선택지 */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {event.choices.map((c) => {
          const isSelected = selected === c.index
          const isOther = selected !== null && !isSelected
          return (
            <button
              key={c.index}
              onClick={() => handleChoice(c.index)}
              disabled={disabled || selected !== null}
              className={`
                w-full text-left p-3 rounded-xl border transition-all duration-200
                ${isSelected ? 'border-blue-500 bg-blue-500/15' : ''}
                ${isOther ? 'border-white/5 bg-white/[0.02] opacity-40' : ''}
                ${selected === null ? 'border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10 active:scale-[0.99]' : ''}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex gap-2">
                <span className={`font-bold text-sm mt-0.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}>
                  {String.fromCharCode(65 + c.index)}.
                </span>
                <div>
                  <p className="text-white text-sm font-medium leading-snug">{c.text}</p>
                  <p className="text-gray-500 text-xs mt-1">{c.hint}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
