# React Learning — abc_staking Frontend

This folder is your personal React learning lab. Each phase teaches you one core React concept by building a real piece of the staking frontend. By the end you will have a working staking UI and a solid understanding of React.

## How this works

- Each phase has its own folder with a detailed explanation file and code examples
- You copy the relevant code into `packages/frontend/src` and run it in the browser
- You read the explanation, write the code yourself (don't just copy-paste), and observe the result
- Each phase builds on the previous one

## Phases

| Phase | Folder | Concept | What you build |
|-------|--------|---------|----------------|
| 0 | phase-0-tailwind-setup | Tailwind CSS installation and crash course | Dev environment ready, colour palette defined |
| 1 | phase-1-components-and-props | Components, Props, JSX | Static staking dashboard layout |
| 2 | phase-2-usestate | useState hook | Connect wallet button with toggle state |
| 3 | phase-3-useeffect | useEffect hook | Fetch and display wallet balance |
| 4 | phase-4-forms-and-events | Controlled inputs, events | Stake / Unstake input form |
| 5 | phase-5-context-api | Context API | Global wallet state across components |
| 6 | phase-6-custom-hooks | Custom hooks | useWallet and useStaking hooks |

## Running the frontend

From the monorepo root:

```bash
pnpm --filter frontend dev
```

Then open http://localhost:5173 in your browser.

## Tools you are using

- **React 19** — the UI library
- **Vite** — the dev server and bundler (replaces Create React App)
- **TypeScript** — typed JavaScript
- **pnpm** — package manager

---

Start with `phase-0-tailwind-setup/LESSON.md`.
