# Phase 0 — Tailwind CSS Setup

Do this before Phase 1. The rest of the lessons use Tailwind for styling instead of plain CSS files.

---

## What is Tailwind CSS?

Tailwind is a **utility-first CSS framework**. Instead of writing a `.css` file with class names, you apply small single-purpose classes directly in your JSX:

```tsx
// Plain CSS approach
<button className="connect-button">Connect</button>
// connect-button { background: purple; padding: 8px 16px; border-radius: 8px; }

// Tailwind approach — no CSS file needed
<button className="bg-purple-600 px-4 py-2 rounded-lg text-white">Connect</button>
```

Every class does exactly one thing:
- `bg-purple-600` → `background-color: #7c3aed`
- `px-4` → `padding-left: 1rem; padding-right: 1rem`
- `py-2` → `padding-top: 0.5rem; padding-bottom: 0.5rem`
- `rounded-lg` → `border-radius: 0.5rem`
- `text-white` → `color: white`

Tailwind scans your JSX files and only includes the CSS classes you actually use — so the final CSS bundle is tiny.

---

## Installing Tailwind in the Vite + React project

Run all commands from inside `packages/frontend/`.

### Step 1 — Install Tailwind and its Vite plugin

```bash
cd packages/frontend
pnpm add -D tailwindcss @tailwindcss/vite
```

- `tailwindcss` — the framework itself
- `@tailwindcss/vite` — the Vite plugin that integrates Tailwind into your build

### Step 2 — Add the plugin to `vite.config.ts`

Open `packages/frontend/vite.config.ts`. It currently looks like this:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Add the Tailwind plugin:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### Step 3 — Add Tailwind to your CSS entry point

Open `packages/frontend/src/index.css`. Delete everything in it and replace with just this one line:

```css
@import "tailwindcss";
```

This single import pulls in all of Tailwind's base styles and utilities.

### Step 4 — Verify it works

Start the dev server:

```bash
pnpm --filter frontend dev
```

Open `packages/frontend/src/App.tsx` and replace its contents with this temporary test:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-purple-400 mb-2">ABC Staking</h1>
        <p className="text-gray-400">Tailwind is working</p>
      </div>
    </div>
  )
}

export default App
```

You should see a dark page with a card, purple heading, and grey subtext. If you do, Tailwind is set up correctly.

### Step 5 — Clean up `App.css`

You no longer need `App.css` since Tailwind replaces it. Delete the file and remove the import from `App.tsx`:

```tsx
// Remove this line from App.tsx:
import './App.css'
```

---

## Tailwind crash course — the classes you will use most

### Layout

| Class | What it does |
|-------|-------------|
| `flex` | `display: flex` |
| `flex-col` | `flex-direction: column` |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `justify-center` | `justify-content: center` |
| `gap-4` | `gap: 1rem` (4 = 1rem, 2 = 0.5rem, 8 = 2rem) |
| `grid` | `display: grid` |
| `grid-cols-3` | `grid-template-columns: repeat(3, 1fr)` |

### Sizing and spacing

| Class | What it does |
|-------|-------------|
| `w-full` | `width: 100%` |
| `max-w-4xl` | `max-width: 56rem` |
| `mx-auto` | `margin-left: auto; margin-right: auto` (centers a block) |
| `p-4` | `padding: 1rem` (all sides) |
| `px-4` | padding left + right |
| `py-2` | padding top + bottom |
| `mt-4` | `margin-top: 1rem` |
| `mb-2` | `margin-bottom: 0.5rem` |

### Colors — the scale

Tailwind colors go from `50` (lightest) to `950` (darkest):

```
gray-50  gray-100  gray-200 ... gray-800  gray-900  gray-950
```

For a dark Web3 UI you will mostly use `gray-950`, `gray-900`, `gray-800` for backgrounds and `gray-400`, `gray-300` for text.

| Class | What it does |
|-------|-------------|
| `bg-gray-950` | very dark background |
| `bg-gray-800` | card background |
| `text-white` | white text |
| `text-gray-400` | muted grey text |
| `text-purple-400` | purple accent text |
| `bg-purple-600` | purple button background |
| `border-gray-700` | subtle border |

### Typography

| Class | What it does |
|-------|-------------|
| `text-sm` | small text (0.875rem) |
| `text-base` | default (1rem) |
| `text-xl` | large (1.25rem) |
| `text-3xl` | 1.875rem |
| `font-bold` | bold |
| `font-semibold` | semi-bold |
| `uppercase` | all caps |
| `tracking-wider` | letter spacing |
| `font-mono` | monospace font (for addresses) |

### Borders and radius

| Class | What it does |
|-------|-------------|
| `rounded-lg` | border-radius: 0.5rem |
| `rounded-xl` | border-radius: 0.75rem |
| `rounded-2xl` | border-radius: 1rem |
| `border` | 1px solid border |
| `border-gray-700` | border color |

### Interactivity

| Class | What it does |
|-------|-------------|
| `cursor-pointer` | hand cursor on hover |
| `cursor-not-allowed` | disabled cursor |
| `opacity-50` | 50% opacity |
| `disabled:opacity-50` | opacity 50% when disabled |
| `hover:bg-purple-700` | darker on hover |
| `transition-colors` | animate color changes |
| `duration-200` | 200ms transition |

### Conditional classes

In React you often need to apply classes conditionally. Use a ternary:

```tsx
<button className={`rounded-lg px-4 py-2 ${isActive ? "bg-purple-600" : "bg-gray-700"}`}>
  Click
</button>
```

For more complex conditional classes, install the `clsx` library:

```bash
pnpm --filter frontend add clsx
```

```tsx
import clsx from "clsx"

<button className={clsx(
  "rounded-lg px-4 py-2 font-semibold",
  isActive && "bg-purple-600 text-white",
  !isActive && "bg-gray-700 text-gray-300",
  isPending && "opacity-50 cursor-not-allowed"
)}>
  Click
</button>
```

`clsx` joins class names and ignores `false`/`null`/`undefined` values — much cleaner than string concatenation for many conditions.

---

## The colour palette for the ABC Staking UI

Use these consistently across all phases:

| Purpose | Class |
|---------|-------|
| Page background | `bg-gray-950` |
| Card background | `bg-gray-900` |
| Card border | `border border-gray-800` |
| Primary text | `text-white` |
| Secondary text | `text-gray-400` |
| Muted / label text | `text-gray-500` |
| Primary accent | `bg-purple-600` / `text-purple-400` |
| Success | `text-green-400` / `bg-green-950` |
| Error | `text-red-400` / `bg-red-950` |
| Wallet address | `font-mono text-gray-300` |

---

## Checklist before moving to Phase 1

- [ ] `pnpm add -D tailwindcss @tailwindcss/vite` ran successfully
- [ ] `vite.config.ts` has `tailwindcss()` in the plugins array
- [ ] `src/index.css` contains only `@import "tailwindcss"`
- [ ] The test card renders with dark background and purple heading
- [ ] `App.css` deleted and its import removed from `App.tsx`

Once all boxes are checked, move to `../phase-1-components-and-props/LESSON.md`.
