# Repository Overview
Svelte + TypeScript Chrome extension. Below: dev commands, style guide, and file map.

## 1. Dev Commands
- **Build**: `npm run build` — production bundle  
- **Lint**: `npm run check` — ESLint  
- **Format**: `npm run format` — Prettier  
- **Test**: _(none yet)_

## 2. Style Guide
- Prettier (`.prettierrc`): 2-space indent, semicolons required  
- TypeScript (`target: ESNext`, `checkJs: true`)  
- ESNext import/export  
- Svelte conventions; no global error-handling pattern (TBD)

## 3. Source Tree
```

src/
├ app.css              # global light/dark styles
├ vite-env.d.ts        # Vite env types
│
├ background/index.ts  # service-worker opens side-panel
│
├ components/Sidepanel.svelte
│   └─ UI: AI provider iframe, settings, capture buttons
│
├ contentscript/
│   ├ index.ts         # extract article/selection/YT transcript
│   ├ chatgpt.ts       # inject text → ChatGPT, chunk & send
│   └ gemini.ts        # inject text → Gemini, chunk & send
│
├ lib/utils.ts         # shared types + helpers
│
└ sidepanel/
├ index.html       # Bootstrap shell, mounts Svelte
└ index.ts         # boots Sidepanel.svelte

```

### Key Helpers (`lib/utils.ts`)
`ArticleSnapshot`, `OpenAIRequest/Response`, enums (`ArticleSnapshotType`, `TextType`), plus  
`getSelection`, `replaceTemplateVariables`, `toSummarySource`, `parseXmlToTranscript`.

## 4. Next Steps
- Add `npm run test` + initial tests  
- Decide on project-wide error policy  
- Keep this doc current
```
