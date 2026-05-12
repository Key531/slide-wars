'use client'

import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'

export default function MenuPage() {
  const router = useRouter()
  const initGame = useGameStore(s => s.initGame)

  const handleStart = () => {
    initGame()
    router.push('/game')
  }

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* 상단 태그 */}
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-[10px] font-mono text-blue-400 border border-blue-500/30 px-2 py-1 rounded-full bg-blue-500/10">CORPORATE SURVIVAL</span>
          <span className="text-[10px] font-mono text-gray-500 border border-gray-700 px-2 py-1 rounded-full">STRATEGY SIM</span>
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight text-white mb-1 drop-shadow-lg">
            장표 전쟁
          </div>
          <div className="text-gray-500 text-xs font-mono tracking-[0.3em] mt-1">SLIDE WARS</div>
          <div className="mt-5 text-gray-400 text-sm leading-relaxed text-center max-w-xs">
            보고서 한 장이 당신의 운명을 결정한다.<br />
            <span className="text-blue-400 font-medium">모든 선택에는 대가가 있다.</span>
          </div>
        </div>

        {/* 게임 정보 카드 */}
        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { icon: '📅', label: '12주', sub: '플레이' },
            { icon: '⚡', label: '30개+', sub: '이벤트' },
            { icon: '🏁', label: '8가지', sub: '엔딩' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/8">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-bold text-sm">{item.label}</span>
              <span className="text-gray-500 text-[10px]">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* 티저 문구 */}
        <div className="w-full p-4 rounded-xl bg-[#1a1f2e] border border-white/10 space-y-2">
          {[
            '"한 장으로 줄여봐." — 최 실장',
            '"말이 많으면 실행이 없다는 거야." — 이 전무',
            '"이건 GPT로 5분이면 되는 거 아닌가요?" — 박 상무',
          ].map((q, i) => (
            <p key={i} className="text-gray-400 text-xs italic">{q}</p>
          ))}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all font-bold text-white text-base shadow-lg shadow-blue-900/40"
        >
          게임 시작 →
        </button>

        <p className="text-gray-700 text-[10px] text-center">
          특정 기업·인물과 무관한 풍자 게임입니다
        </p>
      </div>
    </main>
  )
}
