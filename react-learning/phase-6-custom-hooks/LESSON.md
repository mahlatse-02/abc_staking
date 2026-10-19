# Phase 6 — Custom Hooks

## What is a custom hook?

A custom hook is a regular JavaScript function whose name starts with `use` and that calls one or more React hooks inside it. That's the entire definition.

Custom hooks are not a new API — they are a pattern for extracting stateful logic out of components. When you find yourself copy-pasting the same `useState` + `useEffect` combo across multiple components, that logic belongs in a custom hook.

```tsx
// Instead of this in every component that needs the window size:
const [width, setWidth] = useState(window.innerWidth)
useEffect(() => {
  const handler = () => setWidth(window.innerWidth)
  window.addEventListener("resize", handler)
  return () => window.removeEventListener("resize", handler)
}, [])

// Write this once:
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])
  return width
}

// And use it anywhere:
const width = useWindowWidth()
```

---

## Rules of custom hooks

1. The name **must start with `use`** — this is how React (and linters) know it is a hook
2. It can call any React hook — `useState`, `useEffect`, `useContext`, other custom hooks
3. It follows the same rules as regular hooks — only call at top level, only in React components or other hooks

---

## What custom hooks return

A hook can return anything:
- A single value: `return balance`
- An array (like useState): `return [value, setValue]`
- An object (most common for multiple values): `return { balance, isLoading, error, refetch }`

Objects are preferred when returning multiple things because you can destructure by name:

```tsx
const { balance, isLoading, error } = useStakerBalance(walletAddress)
```

---

## The difference between a component and a custom hook

| Component | Custom Hook |
|-----------|-------------|
| Returns JSX | Returns data/functions |
| Capitalized name: `StakeCard` | `use` prefix: `useStakerBalance` |
| Rendered in JSX: `<StakeCard />` | Called in a component: `useStakerBalance(...)` |
| Each instance has own state | Each call has own state |

---

## A real custom hook: `useStakerBalance`

This hook encapsulates fetching balance data. Any component that needs it just calls `useStakerBalance()` and gets back `{ staked, rewards, apy, isLoading, error, refetch }`. The component doesn't care how the data is fetched.

```tsx
// src/hooks/useStakerBalance.ts

import { useState, useEffect, useCallback } from "react"

type BalanceData = {
  staked: string
  rewards: string
  apy: string
}

type UseStakerBalanceReturn = {
  balanceData: BalanceData | null
  isLoading: boolean
  error: string
  refetch: () => void
}

export function useStakerBalance(walletAddress: string): UseStakerBalanceReturn {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) {
      setBalanceData(null)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Phase 6 real version — replace the setTimeout with:
      // const staked = await stakingContract.stakedAmount(walletAddress)
      // const rewards = await stakingContract.pendingRewards(walletAddress)
      // const apy = await stakingContract.currentAPY()
      await new Promise(resolve => setTimeout(resolve, 1200))

      setBalanceData({ staked: "1,000.00", rewards: "42.50", apy: "12.4" })
    } catch (err) {
      setError("Failed to load balances")
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return { balanceData, isLoading, error, refetch: fetchBalances }
}
```

### What is `useCallback`?

`useCallback` memoizes a function — it returns the same function reference between renders unless its dependencies change. Without it:

```tsx
// Without useCallback:
// Every render creates a new fetchBalances function reference
// useEffect sees a "new" function → re-runs → fetches again → re-renders → infinite loop

// With useCallback:
// fetchBalances has a stable reference that only changes when walletAddress changes
// useEffect only re-runs when walletAddress actually changes
```

The dependency array works the same as `useEffect` — only recreate the function when these values change.

---

## Refactoring `BalanceDisplay` to use the hook

Before (all logic inside the component):
```tsx
function BalanceDisplay() {
  const { walletAddress } = useWallet()
  const [balanceData, setBalanceData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // 20 lines of fetching logic
  }, [walletAddress])

  // JSX...
}
```

After (logic extracted to a hook):
```tsx
function BalanceDisplay() {
  const { walletAddress } = useWallet()
  const { balanceData, isLoading, error, refetch } = useStakerBalance(walletAddress)

  // Just JSX — no logic
}
```

The component is now purely about rendering. The data-fetching logic lives in the hook and can be reused anywhere.

---

## Exercise — Create `useStakerBalance` and `useStakeAction`

### Step 1 — Create `src/hooks/useStakerBalance.ts`

Paste the full hook code from the section above.

### Step 2 — Create `src/hooks/useStakeAction.ts`

This hook handles the stake/unstake transaction logic:

```tsx
// src/hooks/useStakeAction.ts

import { useState } from "react"

type ActionType = "stake" | "unstake"

type UseStakeActionReturn = {
  isPending: boolean
  txHash: string
  error: string
  execute: (action: ActionType, amount: string, walletAddress: string) => Promise<boolean>
  reset: () => void
}

export function useStakeAction(): UseStakeActionReturn {
  const [isPending, setIsPending] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  async function execute(
    action: ActionType,
    amount: string,
    walletAddress: string
  ): Promise<boolean> {
    setIsPending(true)
    setTxHash("")
    setError("")

    try {
      // Phase 6 real version — replace with:
      // if (action === "stake") {
      //   const tx = await stakingContract.stake(parseEther(amount))
      //   await tx.wait()
      //   setTxHash(tx.hash)
      // } else {
      //   const tx = await stakingContract.unstake(parseEther(amount))
      //   await tx.wait()
      //   setTxHash(tx.hash)
      // }

      console.log(`${action} ${amount} ABC from ${walletAddress}`)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const fakeTxHash = "0x" + Math.random().toString(16).slice(2, 66)
      setTxHash(fakeTxHash)
      return true
    } catch (err) {
      setError("Transaction failed. Please try again.")
      return false
    } finally {
      setIsPending(false)
    }
  }

  function reset() {
    setTxHash("")
    setError("")
  }

  return { isPending, txHash, error, execute, reset }
}
```

### Step 3 — Refactor `BalanceDisplay.tsx` to use `useStakerBalance`

```tsx
// src/components/BalanceDisplay.tsx
import { useWallet } from "../context/WalletContext"
import { useStakerBalance } from "../hooks/useStakerBalance"

function BalanceDisplay() {
  const { walletAddress } = useWallet()
  const { balanceData, isLoading, error, refetch } = useStakerBalance(walletAddress)

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
    return (
      <div className="balance-error">
        <p className="error">{error}</p>
        <button className="btn btn-outline" onClick={refetch}>Retry</button>
      </div>
    )
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

Notice the component is now short and focused purely on rendering. The data logic is completely hidden in the hook.

### Step 4 — Refactor `StakeForm.tsx` to use `useStakeAction`

```tsx
// src/components/StakeForm.tsx
import { useState } from "react"
import { useWallet } from "../context/WalletContext"
import { useStakeAction } from "../hooks/useStakeAction"

type Tab = "stake" | "unstake"

function StakeForm() {
  const { walletAddress } = useWallet()
  const { isPending, txHash, error: txError, execute, reset } = useStakeAction()

  const [activeTab, setActiveTab] = useState<Tab>("stake")
  const [amount, setAmount] = useState<string>("")
  const [validationError, setValidationError] = useState<string>("")

  function validate(): boolean {
    if (!amount.trim()) {
      setValidationError("Please enter an amount")
      return false
    }
    const num = Number(amount)
    if (isNaN(num) || num <= 0) {
      setValidationError("Enter a valid amount greater than 0")
      return false
    }
    setValidationError("")
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    const success = await execute(activeTab, amount, walletAddress)
    if (success) setAmount("")
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setAmount("")
    setValidationError("")
    reset()
  }

  if (!walletAddress) {
    return (
      <div className="form-card">
        <p className="form-placeholder">Connect wallet to stake</p>
      </div>
    )
  }

  return (
    <div className="form-card">
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === "stake" ? "active" : ""}`}
          onClick={() => handleTabChange("stake")}
          type="button"
        >
          Stake
        </button>
        <button
          className={`tab-btn ${activeTab === "unstake" ? "active" : ""}`}
          onClick={() => handleTabChange("unstake")}
          type="button"
        >
          Unstake
        </button>
      </div>

      <form onSubmit={handleSubmit} className="stake-form">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">Amount (ABC)</label>
          <div className="input-wrapper">
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (validationError) setValidationError("")
              }}
              className={`form-input ${validationError ? "input-error" : ""}`}
              min="0"
              step="0.01"
              disabled={isPending}
            />
            <button
              type="button"
              className="max-btn"
              onClick={() => setAmount("1000")}
              disabled={isPending}
            >
              MAX
            </button>
          </div>
          {validationError && <p className="error-msg">{validationError}</p>}
          {txError && <p className="error-msg">{txError}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isPending || !amount}
        >
          {isPending
            ? activeTab === "stake" ? "Staking..." : "Unstaking..."
            : activeTab === "stake" ? "Stake ABC" : "Unstake ABC"
          }
        </button>

        {txHash && (
          <div className="tx-success">
            <p>Transaction submitted!</p>
            <p className="tx-hash">{txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default StakeForm
```

### Step 5 — Add balance-error style to `App.css`

```css
.balance-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
}
```

### Step 6 — Run and test

```bash
pnpm --filter frontend dev
```

The app behaves exactly the same but the code is organized into:

- **Components** — only responsible for rendering JSX
- **Hooks** — encapsulate stateful logic and side effects
- **Context** — global shared state

---

## What you learned in Phase 6

- A custom hook is a function starting with `use` that calls React hooks
- Custom hooks extract and reuse stateful logic across components
- `useCallback` stabilizes function references to avoid `useEffect` re-running unnecessarily
- Hooks return data and functions — components receive and render them
- The separation: Context for global state, hooks for encapsulated logic, components for rendering

---

## Final project structure

```
src/
├── components/
│   ├── Header.tsx           — layout, contains ConnectButton
│   ├── ConnectButton.tsx    — renders wallet button, calls useWallet
│   ├── BalanceDisplay.tsx   — renders balances, calls useStakerBalance
│   ├── StakeForm.tsx        — renders form, calls useStakeAction
│   └── Footer.tsx           — static footer
├── context/
│   └── WalletContext.tsx    — WalletProvider + useWallet hook
├── hooks/
│   ├── useStakerBalance.ts  — fetches and returns balance data
│   └── useStakeAction.ts    — handles stake/unstake transactions
├── App.tsx                  — layout only, no logic
└── main.tsx                 — renders WalletProvider + App
```

---

## What comes next — wiring to a real contract

When your Hardhat contracts are deployed:

1. Copy the compiled ABI from `packages/hardhat/artifacts` to `packages/frontend/src/artifacts`
2. Install ethers.js: `pnpm --filter frontend add ethers`
3. In `WalletContext.tsx` — replace the fake connect with:
   ```tsx
   const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
   setWalletAddress(accounts[0])
   ```
4. In `useStakerBalance.ts` — replace the `setTimeout` with:
   ```tsx
   const provider = new ethers.BrowserProvider(window.ethereum)
   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
   const staked = await contract.stakedAmount(walletAddress)
   ```
5. In `useStakeAction.ts` — replace the `setTimeout` with:
   ```tsx
   const provider = new ethers.BrowserProvider(window.ethereum)
   const signer = await provider.getSigner()
   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
   const tx = await contract.stake(ethers.parseEther(amount))
   await tx.wait()
   setTxHash(tx.hash)
   ```

Because you built with the hook pattern, **you only change the hooks** — the components stay exactly the same.

---

## Checkpoint questions

1. What makes a function a custom hook (two rules)?
2. What is `useCallback` and why is it needed in `useStakerBalance`?
3. What does each layer of the architecture do: components, hooks, context?
4. Why is the hook pattern especially useful when you eventually wire to a real contract?
5. What would break if you named the hook `stakerBalance` instead of `useStakerBalance`?
