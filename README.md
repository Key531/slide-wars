# 장표 전쟁 · Slide Wars

한국 대기업 조직 생존 전략 게임. 모든 선택에는 대가가 있다.

## 로컬 실행

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Vercel 배포

1. 이 폴더를 GitHub 레포로 push
2. vercel.com → New Project → Import
3. Framework: Next.js (자동 감지)
4. Deploy

## 구조

- `app/` — 페이지 (메뉴 · 게임 · 결과)
- `components/game/` — UI 컴포넌트
- `data/` — 이벤트·엔딩 JSON
- `lib/game/` — 게임 엔진
- `store/` — Zustand 상태관리
