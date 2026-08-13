# Skill Domain Routing

When a user's task involves a specific domain, use these decision trees to pick the RIGHT skill based on user intent.

## Frontend / UI

```
User wants to...
├── Replicate a mockup, screenshot, or video    → /an:frontend-design
├── Build React/TS components with best practices → /ui-builder
├── Style with Tailwind CSS + shadcn/ui          → /ui-styling
├── Choose colors, fonts, layout, design system  → /ui-ux-pro-max
├── Audit existing UI for accessibility/UX       → /web-design-guidelines
├── Apply React performance patterns             → (check an:react-best-practices or use ui-builder)
├── Build with Stitch (AI design generation)     → (check bootstrap)
├── Create 3D / WebGL / Three.js experience      → /threejs
└── Build programmatic video with Remotion       → (check bootstrap or web-frameworks)
```

## Codebase Understanding

```
User wants to...
├── Quick file search, locate specific code     → /an-scout
├── Onboard a new repo / dump codebase for LLM  → (check repomix integration)
├── Semantic go-to-definition, find-usages      → (check an:scout-ext)
└── Build a queryable knowledge graph from code → /ck-graphify
```

## Backend / API

```
User wants to...
├── Build REST/GraphQL API (NestJS, FastAPI, Django) → /backend-development
├── Add authentication (OAuth, JWT, passkeys)        → /better-auth
└── Integrate payments (Stripe, Polar, SePay)        → /payment-integration
```

## Database

```
User wants to...
├── Design schemas, write SQL/NoSQL queries     → /databases
├── Optimize indexes, migrations, replication   → /databases
└── Add auth with database-backed sessions      → /better-auth
```

## Infrastructure / Deployment

```
User wants to...
├── Deploy to Vercel, Netlify, Railway, Fly.io   → /deploy
└── Docker, Kubernetes, CI/CD pipelines, GitOps   → /devops
```

## Security

```
User wants to...
├── STRIDE/OWASP security audit with auto-fix    → /ck-security
├── Scan for secrets, vulnerabilities, OWASP patterns → /an-security
└── OSINT / CTI / threat-intel investigation     → /cti-expert
```

## AI / LLM

```
User wants to...
├── Optimize context, agent architecture, memory → /context-engineering
├── Generate llms.txt, LLM-friendly docs         → /docs-seeker
├── Build AI agents with Google ADK              → /google-adk-python
├── Generate/analyze images, audio, video with AI → /ai-multimodal
└── Learn the autoresearch pattern / find the right family member → /ck-autoresearch
```

## Browser / Chrome

```
User wants to...
├── Target a real Chrome profile through browser MCP → /an-chrome-profile
├── Automate with Puppeteer CLI scripts             → /chrome-devtools
├── Browser automation without real user cookies    → /agent-browser
└── Drive user's real Chrome profile/cookies        → /chrome-profile
```

## Testing

```
User wants to...
├── Run test suites, coverage reports, TDD          → /an-test
├── Test strategy + Playwright/Vitest/k6 runner    → /web-testing
└── Verify fix works in real browser               → /an-verify
```

## Documentation

```
User wants to...
├── Update project docs (codebase-summary, PDR)   → /an-docs
├── Search library/framework docs (context7)        → /docs-seeker
├── Build docs site with Mintlify                  → /mintlify
├── Read long-form docs / RFCs / specs in browser  → /markdown-novel-viewer
├── Generate session hand-off / EOD summary        → /watzup
└── Sprint retrospective from git history          → /retro
```

## Documents / Office Files

```
User wants to...
├── Create / edit / extract from .docx (Word)         → (check document-skills)
├── Create / edit / extract from .pdf (forms, tables) → (check document-skills)
├── Create / edit / extract from .pptx (PowerPoint)   → (check document-skills)
└── Create / edit / extract from .xlsx (spreadsheets) → (check document-skills)
```

## Content / Copy

```
User wants to...
├── Write landing page, email, headline copy     → /copywriting
├── Brand identity, logos, banners               → /design
└── Create Excalidraw diagrams                  → /excalidraw
```

## Workflow Skills

Core workflow skills to use with domain skills above:

```
/an-plan     → Create implementation plan (use before any feature implementation)
/an-cook     → Execute implementation following plan
/an-fix      → Debug and fix issues
/an-brainstorm → Brainstorm solutions before planning
/an-scenario  → Generate edge cases and test scenarios
/an-predict   → 5 expert personas debate proposed changes
```

## Usage Notes

- Pick ONE skill per distinct user intent
- If a task spans two domains (e.g. "build + deploy"), suggest the primary skill and mention the secondary
- Domain skills combine with core workflow: `/an-plan` → domain skill → `/an-cook`
- Skills not listed here are either core workflow skills or utility skills activated on demand
- For unknown skill availability, check `.claude/skills/` directory
