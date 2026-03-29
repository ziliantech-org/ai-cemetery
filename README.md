# AI Cemetery / AI赛博公墓

A cyber cemetery for defunct AI projects and large language models. Light a candle, leave flowers, press F to pay respects, or write a eulogy — so no model is ever truly forgotten.

为已停运的AI项目和大语言模型建立的赛博墓园。点一支蜡烛、献一束花、按F致敬、写一篇悼词——让每个模型都不会被真正遗忘。

## Features / 功能特色

- **Cemetery Scene** — Horizontal scrolling graveyard with tombstones, fog, and moonlight effects
- **Interactions** — Light candles, place flowers, burn incense, press F, write eulogies
- **Timeline View** — Browse departed AI models by year
- **i18n** — English & Chinese (next-intl)
- **Auth** — Email verification code login
- **Responsive** — Horizontal scroll on desktop, grid layout on mobile

## Residents / 墓园居民

Google Bard, GPT-3, DALL·E 2, Codex, Claude 1, Galactica, BlenderBot 3, Stable Diffusion 1.x, ERNIE Bot v1, Qwen v1, Jasper AI, GitHub Copilot v1, InstructGPT, LaMDA, Midjourney v1-v3, and more...

## Tech Stack / 技术栈

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom `cemetery-*` theme tokens
- **Animation**: Framer Motion
- **Database**: SQLite (better-sqlite3), auto-created on first request
- **i18n**: next-intl (en / zh)

## Quick Start / 快速开始

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

SMTP is optional. Without it, verification codes are printed to the console.

```bash
# (Optional) Configure SMTP
cp .env.example .env
# Edit .env with your SMTP credentials
```

## Docker

```bash
# Start with Docker Compose
docker compose up -d

# View logs (verification codes appear here if SMTP is not configured)
docker compose logs -f

# Stop
docker compose down
```

## Kubernetes

A minimal deployment manifest is provided. Edit ConfigMap/Secret values before applying:

```bash
kubectl apply -f deployment.yaml
kubectl port-forward -n ai-cemetery svc/ai-cemetery 3000:80
```

## Project Structure / 项目结构

```
src/
├── app/
│   ├── [locale]/          # i18n pages (en / zh)
│   └── api/               # API routes (auth, counters, eulogies, visitors)
├── components/
│   ├── Cemetery/          # Scene, Tombstone, Fog, Moonlight
│   ├── Interactions/      # Candle, Flowers, Incense, PressF, Eulogy, Share
│   ├── Modal/             # Model detail modal
│   └── Timeline/          # Timeline view
├── data/models.ts         # AI model definitions (bilingual)
├── lib/
│   ├── db.ts              # SQLite operations
│   ├── auth.ts            # Session & verification
│   ├── email.ts           # Nodemailer (SMTP optional)
│   └── firebase.ts        # API client
└── i18n/                  # Routing & locale config
```

## Contributing / 贡献

PRs welcome! To add a new AI model, edit `src/data/models.ts` with both English and Chinese fields.

欢迎提交 PR！添加新 AI 模型时请编辑 `src/data/models.ts`，需同时提供中英文字段。

## License / 开源协议

[MIT](LICENSE)
