# Phase 2 — useState

## The problem with plain variables

In Phase 1 you hardcoded the wallet address as a prop. But what happens when a user clicks "Connect Wallet"? You need to store the address somewhere and update the UI when it changes.

Your first instinct might be to use a regular variable:

```tsx
let walletAddress = ""

function handleClick() {
  walletAddress = "0xabc...123"
}
```

This does NOT work in React. When `walletAddress` changes, React has no idea it changed, so it never re-renders the component. The UI stays frozen.

React needs to be told when data changes so it can re-render. That is what **state** is — data that React watches and re-renders the component whenever it changes.

---

## useState — the state hook

`useState` is a **hook** — a special React function that adds capabilities to your component. Hooks always start with the word `use`.

```tsx
import { useState } from "react"

function ConnectButton() {
  const [walletAddress, setWalletAddress] = useState("")
  //     ↑ current value   ↑ setter function   ↑ initial value

  return <p>{walletAddress || "Not connected"}</p>
}
```

`useState("")` returns an **array of two things**:
1. The current value of the state (`walletAddress`)
2. A function to update it (`setWalletAddress`)

You destructure them immediately with `const [value, setValue]`. This naming pattern is a React convention — always name the setter `set` + the variable name.

---

## How re-rendering works

When you call `setWalletAddress("0xabc")`, React:
1. Updates the internal state value
2. Re-runs your component function from top to bottom
3. Compares the new JSX output with the previous one
4. Updates only the DOM nodes that changed (this is called **reconciliation**)

This is why React is efficient — it does not re-render the entire page, only what changed.

```tsx
// First render: walletAddress = ""
// User clicks → setWalletAddress("0xabc")
// Second render: walletAddress = "0xabc"
// React updates only the <p> tag in the DOM
```

---

## The setter replaces, not merges

Unlike `this.setState` in old React class components, the `useState` setter **completely replaces** the value:

```tsx
const [count, setCount] = useState(0)

setCount(5)       // count is now 5
setCount(count + 1) // count is now 6
```

For objects and arrays, you must spread the old value to avoid losing existing fields:

```tsx
const [wallet, setWallet] = useState({ address: "", balance: 0 })

// WRONG — loses the balance field
setWallet({ address: "0xabc" })

// CORRECT — spread old state, override only what changed
setWallet({ ...wallet, address: "0xabc" })
```

---

## State is local and private

Each component instance has its own separate state. If you render `<StakeCard />` three times, each one has its own independent state. They do not share state by default.

```tsx
<StakeCard />  // has its own state
<StakeCard />  // has its own state — completely separate
<StakeCard />  // has its own state — completely separate
```

If multiple components need to share state, you **lift the state up** to their common parent and pass it down as props. This is covered in Phase 5 (Context API).

---

## Rules of hooks

Hooks have strict rules enforced by React:

1. **Only call hooks at the top level of a component** — never inside `if`, `for`, or nested functions
2. **Only call hooks inside React components or custom hooks** — not in plain JS functions

```tsx
// WRONG
function MyComponent() {
  if (someCondition) {
    const [x, setX] = useState(0)  // ❌ inside an if
  }
}

// CORRECT
function MyComponent() {
  const [x, setX] = useState(0)  // ✅ at the top level
  if (someCondition) {
    // use x here
  }
}
```

The reason: React tracks hooks by their call order. If you put them inside conditionals, the order can change between renders and React gets confused.

---

## Event handling in React

To respond to user interaction you attach event handlers as JSX props:

```tsx
<button onClick={handleClick}>Click me</button>
```

Note: you pass the **function reference** (`handleClick`), not a function call (`handleClick()`). If you write `onClick={handleClick()}` it calls the function immediately when the component renders — not when the user clicks.

```tsx
function ConnectButton() {
  const [connected, setConnected] = useState(false)

  function handleClick() {
    setConnected(true)
  }

  return (
    <button onClick={handleClick}>
      {connected ? "Connected" : "Connect Wallet"}
    </button>
  )
}
```

You can also use inline arrow functions for simple cases:

```tsx
<button onClick={() => setConnected(true)}>Connect</button>
```

Use inline arrows for very simple updates. For anything complex, define a named function — it is easier to read and debug.

---

## Common state patterns

### Boolean toggle

```tsx
const [isOpen, setIsOpen] = useState(false)

<button onClick={() => setIsOpen(!isOpen)}>
  {isOpen ? "Close" : "Open"}
</button>
```

### String state (wallet address)

```tsx
const [address, setAddress] = useState<string>("")

// TypeScript generic — tells TS what type the state holds
```

### Functional update (when new state depends on old state)

```tsx
const [count, setCount] = useState(0)

// RISKY — `count` might be stale in async situations
setCount(count + 1)

// SAFE — always uses the latest value
setCount(prev => prev + 1)
```

Use the functional form `prev => prev + 1` whenever the new value depends on the previous value.

---

## Exercise — Connect Wallet button

You will add a "Connect Wallet" button that:
- Shows "Connect Wallet" when disconnected
- Shows a truncated address when connected
- Toggles between connected and disconnected on click

### Step 1 — Create `ConnectButton.tsx`

```tsx
// src/components/ConnectButton.tsx
import { useState } from "react"

// A helper to shorten an address: "0x1234...abcd"
function shortenAddress(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4)
}

function ConnectButton() {
  // walletAddress is "" (empty string) when not connected
  const [walletAddress, setWalletAddress] = useState<string>("")

  // Derived value — compute from state, don't store separately
  const isConnected = walletAddress !== ""

  function handleConnect() {
    // In a real app you would call a wallet library here (Phase 6)
    // For now we simulate a connection with a fake address
    setWalletAddress("0xAbCd1234567890AbCd1234567890AbCd12345678")
  }

  function handleDisconnect() {
    setWalletAddress("")
  }

  if (isConnected) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">{shortenAddress(walletAddress)}</span>
        <button className="btn btn-outline" onClick={handleDisconnect}>
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

### Why `isConnected` is not state

Notice `isConnected` is derived from `walletAddress` — it is not its own `useState`. This is important. **Never store state that can be computed from existing state.** If you had both `walletAddress` and `isConnected` as separate state values you would have to keep them in sync manually, which is a source of bugs. Always derive what you can.

### Step 2 — Update `Header.tsx` to use `ConnectButton`

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

Notice `Header` no longer receives a `walletAddress` prop — the wallet state now lives inside `ConnectButton`. This is fine for now. In Phase 5 you will lift this state up so other components can also access it.

### Step 3 — Update `App.tsx`

Remove the `walletAddress` prop from `<Header />` since `Header` no longer needs it:

```tsx
// src/App.tsx
import Header from "./components/Header"
import StakingDashboard from "./components/StakingDashboard"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <StakingDashboard />
      </main>
      <Footer />
    </div>
  )
}

export default App
```

### Step 4 — Add button styles to `App.css`

```css
/* Add to App.css */
.wallet-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wallet-address {
  font-size: 0.9rem;
  color: #aaa;
  font-family: monospace;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn-primary {
  background: #6c63ff;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
}
```

### Step 5 — Run and test

```bash
pnpm --filter frontend dev
```

Click "Connect Wallet" — the button should change to show a shortened address and a Disconnect button. Click Disconnect — it resets.

---

## What you learned in Phase 2

- Plain variables do not trigger re-renders — you need state
- `useState(initialValue)` returns `[currentValue, setterFunction]`
- Calling the setter re-renders the component with the new value
- Derive values from state rather than storing redundant state
- Event handlers are function references: `onClick={fn}` not `onClick={fn()}`
- Hooks must be called at the top level of a component, never conditionally

---

## Checkpoint questions — answer these to yourself

1. Why does changing a plain `let` variable not update the UI?
2. What does `useState` return?
3. Why is `isConnected` not stored in its own `useState`?
4. What is the difference between `onClick={handleClick}` and `onClick={handleClick()}`?
5. Why must hooks be called at the top level?

---

When you are comfortable, move to `../phase-3-useeffect/LESSON.md`.
