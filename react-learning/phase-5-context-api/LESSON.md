# Phase 5 — Context API

## The prop drilling problem

In Phase 3 you lifted `walletAddress` up to `App.tsx` and passed it down to `Header`, `BalanceDisplay`, and `StakeForm` as props. That worked fine with 3 components.

But imagine you have 10 components deep — `App` → `Layout` → `Page` → `Section` → `Panel` → `Widget` — and only `Widget` needs `walletAddress`. You would have to pass the prop through every intermediate component even though they don't use it. This is called **prop drilling** and it gets messy fast.

```
App (owns walletAddress)
  └── Layout (passes walletAddress, doesn't use it)
        └── Page (passes walletAddress, doesn't use it)
              └── Section (passes walletAddress, doesn't use it)
                    └── Widget (finally uses walletAddress)
```

Context solves this by letting you make data available to any component in the tree **without passing props manually**.

---

## How Context works

Context has three parts:

1. **Create** the context — defines what data the context holds
2. **Provide** the context — wraps the component tree and supplies the data
3. **Consume** the context — any component reads the data with `useContext`

```
Context (the data store)
     ↓
Provider (wraps the tree, supplies values)
     ↓
Any component anywhere in the tree can useContext to read the data
```

---

## Creating a context

```tsx
import { createContext } from "react"

type WalletContextType = {
  walletAddress: string
  isConnected: boolean
}

// createContext takes a default value — used only if there is no Provider above
const WalletContext = createContext<WalletContextType>({
  walletAddress: "",
  isConnected: false,
})
```

The default value is only used when a component tries to consume the context but there is no Provider above it in the tree. In practice you usually pass `null` as the default and handle the null case — you will see this pattern below.

---

## Providing the context

Wrap your component tree with `<WalletContext.Provider value={...}>`. Every component inside the Provider can access the context values.

```tsx
function App() {
  const [walletAddress, setWalletAddress] = useState("")

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected: walletAddress !== "" }}>
      <Header />
      <Main />
      <Footer />
    </WalletContext.Provider>
  )
}
```

When `value` changes (because state updates), all components consuming this context re-render automatically.

---

## Consuming the context

Any component anywhere in the tree can read the context with `useContext`:

```tsx
import { useContext } from "react"

function BalanceDisplay() {
  const { walletAddress, isConnected } = useContext(WalletContext)

  if (!isConnected) return <p>Connect wallet</p>

  return <p>Wallet: {walletAddress}</p>
}
```

No props needed. The component reaches up through the tree and grabs the context value directly.

---

## The standard pattern — Context + custom hook

The raw `useContext` is fine, but there is a cleaner pattern: put the context and its logic in one file, and export a custom hook that wraps `useContext`. This gives you:

- One place to define all wallet-related logic
- A clear API: `const { walletAddress, connect, disconnect } = useWallet()`
- A guard: throw an error if someone uses the hook outside the Provider

```tsx
// src/context/WalletContext.tsx

import { createContext, useContext, useState, ReactNode } from "react"

type WalletContextType = {
  walletAddress: string
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

// null default — we'll guard against this in useWallet
const WalletContext = createContext<WalletContextType | null>(null)

// Provider component — wraps your app
export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState("")

  const isConnected = walletAddress !== ""

  function connect() {
    setWalletAddress("0xAbCd1234567890AbCd1234567890AbCd12345678")
  }

  function disconnect() {
    setWalletAddress("")
  }

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook — the public API for consuming this context
export function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider")
  }

  return context
}
```

`children` is a special React prop that represents whatever JSX is nested between the component's opening and closing tags:

```tsx
<WalletProvider>
  <App />     {/* This is children */}
</WalletProvider>
```

The `ReactNode` type covers anything React can render: JSX, strings, arrays, null.

---

## When to use Context vs Props

Context is not always the right tool. Here is a simple guide:

| Situation | Use |
|-----------|-----|
| Data needed by 1-2 nearby components | Props |
| Data needed by many components at different levels | Context |
| Rapidly changing data (every keystroke) | State + props (Context re-renders all consumers) |
| Global app state (wallet, theme, user) | Context |

Context causes **all consuming components to re-render** when the context value changes. For frequently-changing data this can hurt performance. For relatively stable data like wallet address it is perfect.

---

## Multiple contexts

You can have as many contexts as you need. A common setup:

```tsx
<WalletProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</WalletProvider>
```

Each context is completely independent.

---

## Exercise — Wallet Context

You will refactor the wallet state out of `App.tsx` into a proper context so any component can access it without prop drilling.

### Step 1 — Create `src/context/WalletContext.tsx`

```tsx
// src/context/WalletContext.tsx
import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type WalletContextType = {
  walletAddress: string
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string>("")

  const isConnected = walletAddress !== ""

  async function connect() {
    // In Phase 6 this will use MetaMask/ethers.js
    // For now we simulate it
    await new Promise(resolve => setTimeout(resolve, 500))
    setWalletAddress("0xAbCd1234567890AbCd1234567890AbCd12345678")
  }

  function disconnect() {
    setWalletAddress("")
  }

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useWallet must be used inside WalletProvider")
  return context
}
```

### Step 2 — Wrap the app with `WalletProvider` in `main.tsx`

```tsx
// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { WalletProvider } from "./context/WalletContext"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
)
```

### Step 3 — Simplify `App.tsx` — remove all wallet state

```tsx
// src/App.tsx
import Header from "./components/Header"
import BalanceDisplay from "./components/BalanceDisplay"
import StakeForm from "./components/StakeForm"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  // No wallet state here anymore — it lives in WalletContext
  return (
    <div className="app">
      <Header />
      <main className="main-layout">
        <section className="dashboard">
          <h2>Your Position</h2>
          <BalanceDisplay />
        </section>
        <section className="form-section">
          <h2>Actions</h2>
          <StakeForm />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
```

### Step 4 — Update `Header.tsx` — no more props

```tsx
// src/components/Header.tsx
import ConnectButton from "./ConnectButton"

function Header() {
  return (
    <header className="header">
      <h1>ABC Staking</h1>
      <ConnectButton />
    </header>
  )
}

export default Header
```

### Step 5 — Update `ConnectButton.tsx` — use `useWallet`

```tsx
// src/components/ConnectButton.tsx
import { useState } from "react"
import { useWallet } from "../context/WalletContext"

function shortenAddress(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4)
}

function ConnectButton() {
  const { walletAddress, isConnected, connect, disconnect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  async function handleConnect() {
    setIsConnecting(true)
    await connect()
    setIsConnecting(false)
  }

  if (isConnected) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">{shortenAddress(walletAddress)}</span>
        <button className="btn btn-outline" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}

export default ConnectButton
```

### Step 6 — Update `BalanceDisplay.tsx` — use `useWallet`, remove props

```tsx
// src/components/BalanceDisplay.tsx — update the top
import { useState, useEffect } from "react"
import { useWallet } from "../context/WalletContext"

// Remove the BalanceDisplayProps type and the props parameter
function BalanceDisplay() {
  const { walletAddress } = useWallet()
  // rest of the component stays the same...
```

### Step 7 — Update `StakeForm.tsx` — use `useWallet`, remove props

```tsx
// src/components/StakeForm.tsx — update the top
import { useState } from "react"
import { useWallet } from "../context/WalletContext"

function StakeForm() {
  const { walletAddress } = useWallet()
  // rest of the component stays the same...
```

### Step 8 — Run and test

```bash
pnpm --filter frontend dev
```

The app should behave exactly as before but the code is cleaner — no prop drilling. Any new component you add can call `useWallet()` to get wallet data instantly.

---

## What you learned in Phase 5

- Props work well for nearby components; Context works for globally needed data
- Context has three parts: `createContext`, `Provider`, `useContext`
- `children` is a special prop representing nested JSX
- The Context + custom hook pattern (`useWallet`) provides a clean API and a usage guard
- `createContext(null)` + a guard in the hook is safer than a fake default value
- Context re-renders all consumers when its value changes

---

## Checkpoint questions

1. What is prop drilling and why is it a problem?
2. What are the three parts of the Context API?
3. Why do we throw an error in `useWallet` if context is null?
4. Why did we wrap the app in `main.tsx` rather than `App.tsx`?
5. What is the `children` prop?

---

When comfortable, move to `../phase-6-custom-hooks/LESSON.md`.
