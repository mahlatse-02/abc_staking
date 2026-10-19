# Phase 3 — useEffect

## The problem useEffect solves

React components are designed to be **pure functions** — given the same props and state, they always return the same JSX. But real applications need to do things that reach outside this pure model:

- Fetch data from an API or a blockchain
- Subscribe to events (like wallet account changes)
- Set a timer
- Update the document title

These are called **side effects** — things that affect the world outside the component. `useEffect` is how you safely run side effects in React.

---

## The mental model

Think of `useEffect` like this:

> "After this render is done and the DOM has been updated, run this function."

React renders first, paints to the screen, then runs your effects. This keeps rendering fast and predictable.

---

## Basic syntax

```tsx
import { useEffect } from "react"

useEffect(() => {
  // your side effect here
}, [dependencies])
```

`useEffect` takes two arguments:
1. A **callback function** — the effect to run
2. A **dependency array** — controls when the effect re-runs

---

## The dependency array — the most important concept in useEffect

The dependency array tells React: "only re-run this effect when these values change."

### Case 1 — Empty array `[]`
Run the effect **once**, after the first render only. Never again.

```tsx
useEffect(() => {
  console.log("Component mounted")
}, [])
```

Use this for: initial data fetching, setting up subscriptions on mount.

### Case 2 — With dependencies `[value1, value2]`
Run the effect after the first render, then re-run it whenever any dependency changes.

```tsx
useEffect(() => {
  console.log("walletAddress changed to:", walletAddress)
}, [walletAddress])
```

Use this for: reacting to state or prop changes.

### Case 3 — No array at all
Run the effect after **every** render. This is almost always a mistake — it creates infinite loops if the effect itself triggers a re-render.

```tsx
useEffect(() => {
  // runs after EVERY render — be careful!
})
```

---

## Fetching data with useEffect

This is the most common pattern. You fetch data when the component mounts (or when a dependency changes) and store it in state.

```tsx
import { useState, useEffect } from "react"

function TokenBalance({ walletAddress }: { walletAddress: string }) {
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Don't fetch if there's no wallet address
    if (!walletAddress) return

    async function fetchBalance() {
      setIsLoading(true)
      setError("")

      try {
        // In a real app: const result = await contract.balanceOf(walletAddress)
        // Simulating a network delay with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        setBalance("1,337.50")
      } catch (err) {
        setError("Failed to fetch balance")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [walletAddress]) // Re-fetch whenever walletAddress changes

  if (!walletAddress) return <p>Connect wallet to see balance</p>
  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="error">{error}</p>

  return <p>Balance: {balance} ABC</p>
}
```

### Why is the async function defined inside useEffect?

You cannot make the `useEffect` callback itself `async`:

```tsx
// WRONG — useEffect callbacks cannot be async
useEffect(async () => {
  const data = await fetchSomething()
}, [])
```

The reason: `useEffect` expects either nothing or a **cleanup function** returned from the callback. An `async` function always returns a Promise, not a cleanup function. So you define an inner async function and call it immediately.

```tsx
// CORRECT — define inner async function, call it right away
useEffect(() => {
  async function loadData() {
    const data = await fetchSomething()
  }
  loadData()
}, [])
```

---

## Cleanup functions

Some effects need to be cleaned up — like event listeners or timers. If you return a function from useEffect, React calls it when the component unmounts or before re-running the effect.

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("tick")
  }, 1000)

  // Cleanup — runs when component unmounts or before next effect run
  return () => {
    clearInterval(timer)
  }
}, [])
```

Without cleanup, you would have a memory leak — the timer keeps running even after the component is gone.

### Wallet account change listener (real-world example)

```tsx
useEffect(() => {
  function handleAccountChange(accounts: string[]) {
    setWalletAddress(accounts[0] || "")
  }

  // MetaMask fires this event when the user switches accounts
  window.ethereum?.on("accountsChanged", handleAccountChange)

  // Cleanup — remove the listener when component unmounts
  return () => {
    window.ethereum?.removeListener("accountsChanged", handleAccountChange)
  }
}, []) // Empty array — set up once on mount
```

---

## The stale closure problem

This is a common bug. When your effect captures a state value, it captures the value at the time the effect was created — not the latest value.

```tsx
const [count, setCount] = useState(0)

useEffect(() => {
  const timer = setInterval(() => {
    // BUG: count is always 0 here — it is "stale"
    setCount(count + 1)
  }, 1000)

  return () => clearInterval(timer)
}, []) // empty array — effect only runs once, capturing count=0
```

Fix: use the functional update form or add `count` to the dependency array:

```tsx
// Fix 1 — functional update (doesn't need count in deps)
setCount(prev => prev + 1)

// Fix 2 — add count to deps (effect re-creates timer every time count changes)
}, [count])
```

---

## useEffect execution order

Understanding when effects run:

1. React renders the component (calls the function, gets JSX)
2. React updates the DOM
3. Browser paints to the screen (user sees the update)
4. React runs the useEffect callbacks

Effects always run **after** the render is committed. This means the UI is never blocked by an effect.

---

## Exercise — Live balance display

You will add a balance display that:
- Shows "Connect wallet to see balance" when disconnected
- Shows a loading state for 1.5 seconds when connected
- Shows a fake balance after loading
- Refreshes the balance when the wallet address changes

### Step 1 — Create `BalanceDisplay.tsx`

```tsx
// src/components/BalanceDisplay.tsx
import { useState, useEffect } from "react"

type BalanceDisplayProps = {
  walletAddress: string
}

type BalanceData = {
  staked: string
  rewards: string
  apy: string
}

function BalanceDisplay({ walletAddress }: BalanceDisplayProps) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Guard — do nothing if no wallet connected
    if (!walletAddress) {
      setBalanceData(null)
      return
    }

    async function fetchBalances() {
      setIsLoading(true)
      setError("")

      try {
        // Simulating blockchain call delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // In Phase 6, this will be a real contract call:
        // const staked = await stakingContract.stakedAmount(walletAddress)
        setBalanceData({
          staked: "1,000.00",
          rewards: "42.50",
          apy: "12.4",
        })
      } catch (err) {
        setError("Failed to load balances. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [walletAddress]) // Re-run whenever walletAddress changes

  if (!walletAddress) {
    return (
      <div className="balance-placeholder">
        <p>Connect your wallet to view your staking position.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="cards-grid">
        <div className="stake-card loading">Loading...</div>
        <div className="stake-card loading">Loading...</div>
        <div className="stake-card loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  if (!balanceData) return null

  return (
    <div className="cards-grid">
      <div className="stake-card">
        <p className="card-label">Staked Amount</p>
        <p className="card-value">
          {balanceData.staked} <span className="card-unit">ABC</span>
        </p>
      </div>
      <div className="stake-card">
        <p className="card-label">Earned Rewards</p>
        <p className="card-value">
          {balanceData.rewards} <span className="card-unit">ABC</span>
        </p>
      </div>
      <div className="stake-card">
        <p className="card-label">Current APY</p>
        <p className="card-value">
          {balanceData.apy} <span className="card-unit">%</span>
        </p>
      </div>
    </div>
  )
}

export default BalanceDisplay
```

### Step 2 — The problem: walletAddress is trapped in ConnectButton

Right now, `walletAddress` lives inside `ConnectButton` as local state. But `BalanceDisplay` also needs it. Local state can't be shared between sibling components.

The solution is to **lift the state up** to `App.tsx` — the common parent — and pass it down as props.

### Step 3 — Lift wallet state to `App.tsx`

```tsx
// src/App.tsx
import { useState } from "react"
import Header from "./components/Header"
import BalanceDisplay from "./components/BalanceDisplay"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  // State lives here — the common parent of all components that need it
  const [walletAddress, setWalletAddress] = useState<string>("")

  return (
    <div className="app">
      <Header
        walletAddress={walletAddress}
        onConnect={setWalletAddress}
        onDisconnect={() => setWalletAddress("")}
      />
      <main>
        <section className="dashboard">
          <h2>Your Position</h2>
          <BalanceDisplay walletAddress={walletAddress} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
```

### Step 4 — Update `Header.tsx` to accept callbacks

```tsx
// src/components/Header.tsx
import ConnectButton from "./ConnectButton"

type HeaderProps = {
  walletAddress: string
  onConnect: (address: string) => void
  onDisconnect: () => void
}

function Header({ walletAddress, onConnect, onDisconnect }: HeaderProps) {
  return (
    <header className="header">
      <h1>ABC Staking</h1>
      <ConnectButton
        walletAddress={walletAddress}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
    </header>
  )
}

export default Header
```

### Step 5 — Update `ConnectButton.tsx` to use props instead of local state

```tsx
// src/components/ConnectButton.tsx

type ConnectButtonProps = {
  walletAddress: string
  onConnect: (address: string) => void
  onDisconnect: () => void
}

function shortenAddress(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4)
}

function ConnectButton({ walletAddress, onConnect, onDisconnect }: ConnectButtonProps) {
  const isConnected = walletAddress !== ""

  function handleConnect() {
    onConnect("0xAbCd1234567890AbCd1234567890AbCd12345678")
  }

  if (isConnected) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">{shortenAddress(walletAddress)}</span>
        <button className="btn btn-outline" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={handleConnect}>
      Connect Wallet
    </button>
  )
}

export default ConnectButton
```

`ConnectButton` no longer owns the state — it is a **controlled component**. It receives the current value and callbacks from its parent. This is the standard React pattern for sharing state.

### Step 6 — Add loading styles to `App.css`

```css
/* Add to App.css */
.balance-placeholder {
  margin-top: 1rem;
  padding: 2rem;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px dashed #333;
  text-align: center;
  color: #555;
}

.stake-card.loading {
  color: #444;
  font-size: 0.85rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.error {
  color: #e05555;
  padding: 1rem;
}
```

### Step 7 — Run and test

```bash
pnpm --filter frontend dev
```

1. You should see "Connect your wallet to view your staking position."
2. Click Connect Wallet — the cards show "Loading..." with a pulse animation
3. After 1.5 seconds — the balance data appears
4. Click Disconnect — the cards disappear and the placeholder returns

---

## What you learned in Phase 3

- `useEffect` runs after every render by default
- The dependency array controls when the effect re-runs
- `[]` means "run once on mount" — the most common case for data fetching
- `[walletAddress]` means "re-run when walletAddress changes"
- You cannot make the useEffect callback itself `async` — define an inner async function
- Cleanup functions prevent memory leaks
- Lifting state up solves the problem of sibling components needing the same data
- Controlled components receive value + callbacks from parents instead of owning state

---

## Checkpoint questions

1. What are the three forms of the dependency array and when do you use each?
2. Why can't the useEffect callback itself be `async`?
3. What is a cleanup function and when do you need one?
4. What is "lifting state up" and why did we do it in this phase?
5. What is a "stale closure" in the context of useEffect?

---

When comfortable, move to `../phase-4-forms-and-events/LESSON.md`.
