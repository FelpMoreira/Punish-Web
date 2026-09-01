# Punish-Web

> Frontend do **Punish** — sistema de gerenciamento de torneios de jogos de luta (Single Elimination).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- API: backend Punish em `http://localhost:7000`

## Rodando

```bash
npm install
npm run dev
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Typecheck + build |
| `npm run lint` | Oxlint |

## Estrutura

- `src/pages/` — Home, Login, Register, Dashboard, TournamentList/Detail, Players, Create, Settings
- `src/services/api.ts` — client HTTP + auth (JWT no localStorage)
- `src/components/` — UI e layout (Sidebar etc.)

> Backend: [FelpMoreira/Punish](https://github.com/FelpMoreira/Punish)