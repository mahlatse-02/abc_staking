# Phase 1 — Components and Props

## What is React?

React is a JavaScript library for building user interfaces. Instead of writing one giant HTML file, React lets you break your UI into small, reusable pieces called **components**. Think of components like LEGO bricks — each one does one thing, and you snap them together to build a full page.

React runs entirely in the browser. Vite is the tool that serves your files during development and bundles them for production. When you run `pnpm --filter frontend dev`, Vite starts a local server at http://localhost:5173 and watches your files for changes. Every time you save a file, the browser updates instantly — this is called **Hot Module Replacement (HMR)**.

---

## What is a Component?

A component is just a **JavaScript function that returns HTML-like syntax** called JSX.

```tsx
function Greeting() {
  return <h1>Hello, staker!</h1>
}
```

That's it. That is a React component. The function name must start with a capital letter. The return value looks like HTML but it is actually JSX — a syntax that React compiles into real DOM elements.

### Rules of components
1. The function name must start with a **capital letter** (`StakeCard`, not `stakeCard`)
2. It must return **one root element** — you cannot return two siblings without wrapping them
3. Use `className` instead of `class` for CSS classes (because `class` is a reserved word in JS)

---

## What is JSX?

JSX stands for JavaScript XML. It lets you write HTML inside JavaScript. Under the hood, React converts this:

```tsx
<h1 className="title">Hello</h1>
```

Into this plain JavaScript:

```js
React.createElement("h1", { className: "title" }, "Hello")
```

You never write that verbose version — JSX is the shorthand. TypeScript files that contain JSX use the `.tsx` extension (TypeScript + JSX).

### Embedding JavaScript inside JSX

Use curly braces `{}` to embed any JavaScript expression inside JSX:

```tsx
const name = "Londiwe"
const balance = 1000

return (
  <div>
    <p>Welcome, {name}</p>
    <p>Balance: {balance} tokens</p>
    <p>Double: {balance * 2}</p>
  </div>
)
```

Anything inside `{}` is evaluated as JavaScript. You can put variables, math, function calls, ternary expressions — but NOT `if` statements or `for` loops (those are statements, not expressions).

---

## What are Props?

Props (short for "properties") are how you pass data **into** a component from the outside. They work exactly like HTML attributes.

```tsx
// Defining the component — it receives props
function StakeCard(props) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.amount} tokens</p>
    </div>
  )
}

// Using the component — passing props in
<StakeCard title="My Stake" amount={500} />
```

### Destructuring props (the common pattern)

Instead of writing `props.title` everywhere, you destructure right in the function signature:

```tsx
function StakeCard({ title, amount }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{amount} tokens</p>
    </div>
  )
}
```

### TypeScript prop types

In TypeScript you must define the shape of your props. Use a `type` or `interface`:

```tsx
type StakeCardProps = {
  title: string
  amount: number
  isActive: boolean
}

function StakeCard({ title, amount, isActive }: StakeCardProps) {
  return (
    <div className={isActive ? "card active" : "card"}>
      <h2>{title}</h2>
      <p>{amount} tokens</p>
    </div>
  )
}
```

The `isActive ? "card active" : "card"` is a **ternary expression** — it is the JSX-friendly way to write an if/else inline.

---

## What is the component tree?

In React, components nest inside other components forming a tree. There is always one root component — in your project it is `App`. Everything else renders inside it.

```
App
├── Header
├── StakingDashboard
│   ├── StakeCard (staked amount)
│   ├── StakeCard (rewards)
│   └── StakeCard (APY)
└── Footer
```

Data flows **downward** — from parent to child via props. A child cannot send data up to a parent through props (you need state + callbacks for that, covered in Phase 2).

---

## Your project's file structure (frontend)

```
packages/frontend/
├── index.html          ← the single HTML file Vite serves
├── src/
│   ├── main.tsx        ← entry point, mounts App into index.html
│   ├── App.tsx         ← root component
│   ├── App.css         ← styles for App
│   └── index.css       ← global styles
└── vite.config.ts      ← Vite configuration
```

Open `src/main.tsx`. You will see:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

This is the entry point. It grabs the `<div id="root">` from `index.html` and renders your entire React app inside it. You never need to touch this file.

---

## Exercise — Build the static staking dashboard

You will now create 4 components and wire them together in `App.tsx`.

### Step 1 — Create the folder structure

Inside `packages/frontend/src/` create a folder called `components/`.

```
src/
├── components/
│   ├── Header.tsx
│   ├── StakeCard.tsx
│   ├── StakingDashboard.tsx
│   └── Footer.tsx
├── App.tsx
└── ...
```

### Step 2 — Create `Header.tsx`

```tsx
// src/components/Header.tsx

type HeaderProps = {
  walletAddress: string
}

function Header({ walletAddress }: HeaderProps) {
  return (
    <header className="header">
      <h1>ABC Staking</h1>
      <p>Wallet: {walletAddress}</p>
    </header>
  )
}

export default Header
```

Notice `export default` at the bottom — this makes the component importable in other files.

### Step 3 — Create `StakeCard.tsx`

```tsx
// src/components/StakeCard.tsx

type StakeCardProps = {
  label: string
  value: string
  unit: string
}

function StakeCard({ label, value, unit }: StakeCardProps) {
  return (
    <div className="stake-card">
      <p className="card-label">{label}</p>
      <p className="card-value">
        {value} <span className="card-unit">{unit}</span>
      </p>
    </div>
  )
}

export default StakeCard
```

### Step 4 — Create `StakingDashboard.tsx`

```tsx
// src/components/StakingDashboard.tsx
import StakeCard from "./StakeCard"

function StakingDashboard() {
  return (
    <section className="dashboard">
      <h2>Your Position</h2>
      <div className="cards-grid">
        <StakeCard label="Staked Amount" value="1,000" unit="ABC" />
        <StakeCard label="Earned Rewards" value="42.5" unit="ABC" />
        <StakeCard label="Current APY" value="12.4" unit="%" />
      </div>
    </section>
  )
}

export default StakingDashboard
```

Here you can see components composing other components. `StakingDashboard` renders three `StakeCard` components each with different props.

### Step 5 — Create `Footer.tsx`

```tsx
// src/components/Footer.tsx

function Footer() {
  return (
    <footer className="footer">
      <p>ABC Staking Protocol — Arbitrum</p>
    </footer>
  )
}

export default Footer
```

### Step 6 — Update `App.tsx`

Replace the entire contents of `App.tsx` with:

```tsx
// src/App.tsx
import Header from "./components/Header"
import StakingDashboard from "./components/StakingDashboard"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  return (
    <div className="app">
      <Header walletAddress="0x1234...abcd" />
      <main>
        <StakingDashboard />
      </main>
      <Footer />
    </div>
  )
}

export default App
```

Notice that `walletAddress` is hardcoded as a string prop for now. In Phase 2 you will make it dynamic using state.

### Step 7 — Replace `App.css` with basic styles

```css
/* src/App.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.dashboard {
  margin-top: 2rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stake-card {
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-label {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
}

.card-unit {
  font-size: 1rem;
  color: #888;
}

.footer {
  margin-top: 4rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
  text-align: center;
  color: #555;
  font-size: 0.85rem;
}
```

### Step 8 — Run it

```bash
pnpm --filter frontend dev
```

Open http://localhost:5173. You should see a dark staking dashboard with three stat cards.

---

## What you learned in Phase 1

- A React component is a function that returns JSX
- JSX is HTML-like syntax that compiles to JavaScript
- Props are inputs passed into a component from its parent
- TypeScript makes you define the shape of props with a `type`
- Components compose — you can nest them to build complex UIs
- Data flows downward (parent → child via props)
- `export default` makes a component importable
- Vite serves your app at http://localhost:5173 and auto-refreshes on save

---

## Common mistakes to avoid

| Mistake | Why it breaks | Fix |
|---------|--------------|-----|
| Returning two siblings without a wrapper | JSX must have one root | Wrap in `<div>` or `<>` (fragment) |
| Using `class=` instead of `className=` | `class` is reserved in JS | Use `className=` |
| Component name starts lowercase | React treats it as an HTML tag | Always capitalize: `StakeCard` not `stakeCard` |
| Forgetting `export default` | Other files can't import it | Add `export default ComponentName` |
| Putting an `if` statement inside JSX `{}` | `if` is a statement not an expression | Use ternary `condition ? a : b` instead |

---

When you are comfortable with this, move to `../phase-2-usestate/LESSON.md`.
