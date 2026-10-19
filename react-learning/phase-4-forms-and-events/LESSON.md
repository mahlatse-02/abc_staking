# Phase 4 — Forms and Events

## Controlled vs Uncontrolled inputs

In plain HTML, a form input manages its own value internally. You read it with `document.getElementById('input').value`. This is an **uncontrolled** input — the DOM owns the data.

In React, the preferred approach is **controlled inputs** — React state owns the data, and the input just displays it. Every keystroke updates state, and the state value is fed back into the input:

```
User types → onChange fires → setState called → React re-renders → input displays new value
```

This creates a single source of truth. Your state always matches what the user sees.

```tsx
// Uncontrolled — DOM owns the value (avoid in React)
<input type="text" />

// Controlled — React state owns the value
const [amount, setAmount] = useState("")
<input
  type="text"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
/>
```

---

## The onChange event

Every input fires an `onChange` event whenever its value changes. The event handler receives a **synthetic event** object. You access the input's current value via `e.target.value`:

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value) // the current text in the input
}

<input onChange={handleChange} />
```

React wraps native browser events in `SyntheticEvent` — a cross-browser compatible wrapper. The type for input change events is `React.ChangeEvent<HTMLInputElement>`.

---

## Form submission

Use the `onSubmit` event on the `<form>` element. Always call `e.preventDefault()` to stop the browser from doing a full page reload (the default HTML form behaviour):

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault() // stop page reload
  // process the form data
}

<form onSubmit={handleSubmit}>
  ...
</form>
```

---

## Input validation

Validation state is just more `useState`. Keep an `error` string — empty means no error, non-empty means show the message:

```tsx
const [amount, setAmount] = useState("")
const [error, setError] = useState("")

function validate(): boolean {
  if (!amount) {
    setError("Please enter an amount")
    return false
  }
  if (isNaN(Number(amount))) {
    setError("Must be a valid number")
    return false
  }
  if (Number(amount) <= 0) {
    setError("Amount must be greater than 0")
    return false
  }
  setError("")
  return true
}
```

---

## Multiple inputs — using one handler

For forms with many fields, you can use one handler that reads `e.target.name` to know which field changed:

```tsx
type FormData = {
  amount: string
  duration: string
}

const [formData, setFormData] = useState<FormData>({ amount: "", duration: "" })

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
  //                              ↑ computed property key — the field name
}

<input name="amount" value={formData.amount} onChange={handleChange} />
<input name="duration" value={formData.duration} onChange={handleChange} />
```

`[name]: value` uses a computed property key — the bracket syntax makes the key dynamic. This is plain JavaScript, not React-specific.

---

## Disabled state

Disable the submit button while a transaction is pending or the form is invalid:

```tsx
const [isPending, setIsPending] = useState(false)

<button type="submit" disabled={isPending || !amount}>
  {isPending ? "Staking..." : "Stake"}
</button>
```

---

## Exercise — Stake / Unstake form

You will build a tabbed form with two tabs: Stake and Unstake. Each tab has an amount input and a submit button. On submit, it simulates a blockchain transaction with a 2-second delay.

### Step 1 — Create `StakeForm.tsx`

```tsx
// src/components/StakeForm.tsx
import { useState } from "react"

type StakeFormProps = {
  walletAddress: string
}

type Tab = "stake" | "unstake"

function StakeForm({ walletAddress }: StakeFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>("stake")
  const [amount, setAmount] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isPending, setIsPending] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>("")

  function validate(): boolean {
    if (!amount.trim()) {
      setError("Please enter an amount")
      return false
    }

    const num = Number(amount)

    if (isNaN(num)) {
      setError("Amount must be a valid number")
      return false
    }

    if (num <= 0) {
      setError("Amount must be greater than 0")
      return false
    }

    setError("")
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validate()) return

    setIsPending(true)
    setTxHash("")

    try {
      // Simulating a blockchain transaction — Phase 6 will make this real
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Fake transaction hash
      const fakeTxHash = "0x" + Math.random().toString(16).slice(2, 66)
      setTxHash(fakeTxHash)
      setAmount("") // clear the form on success
    } catch (err) {
      setError("Transaction failed. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setAmount("")
    setError("")
    setTxHash("")
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
    // Clear error as user types
    if (error) setError("")
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
      {/* Tab navigation */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="stake-form">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount (ABC)
          </label>
          <div className="input-wrapper">
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              className={`form-input ${error ? "input-error" : ""}`}
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
          {error && <p className="error-msg">{error}</p>}
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

        {/* Success message */}
        {txHash && (
          <div className="tx-success">
            <p>Transaction submitted!</p>
            <p className="tx-hash">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default StakeForm
```

### Step 2 — Add `StakeForm` to `App.tsx`

```tsx
// src/App.tsx
import { useState } from "react"
import Header from "./components/Header"
import BalanceDisplay from "./components/BalanceDisplay"
import StakeForm from "./components/StakeForm"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  const [walletAddress, setWalletAddress] = useState<string>("")

  return (
    <div className="app">
      <Header
        walletAddress={walletAddress}
        onConnect={setWalletAddress}
        onDisconnect={() => setWalletAddress("")}
      />
      <main className="main-layout">
        <section className="dashboard">
          <h2>Your Position</h2>
          <BalanceDisplay walletAddress={walletAddress} />
        </section>

        <section className="form-section">
          <h2>Actions</h2>
          <StakeForm walletAddress={walletAddress} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
```

### Step 3 — Add form styles to `App.css`

```css
/* Add to App.css */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  margin-top: 2rem;
  align-items: start;
}

.form-section h2,
.dashboard h2 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-card {
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
}

.form-placeholder {
  text-align: center;
  color: #555;
  padding: 1rem 0;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.6rem 1.5rem;
  color: #555;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #6c63ff;
  border-bottom-color: #6c63ff;
}

.tab-btn:hover:not(.active) {
  color: #aaa;
}

.stake-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.form-input {
  flex: 1;
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #6c63ff;
}

.form-input.input-error {
  border-color: #e05555;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Remove number input arrows */
.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.max-btn {
  background: #2a2a3e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0 0.75rem;
  color: #6c63ff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.05em;
}

.max-btn:hover {
  background: #3a3a5e;
}

.error-msg {
  color: #e05555;
  font-size: 0.82rem;
}

.btn-full {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tx-success {
  background: #1a2e1a;
  border: 1px solid #2a5a2a;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  text-align: center;
}

.tx-success p {
  font-size: 0.85rem;
  color: #5aab5a;
}

.tx-hash {
  font-family: monospace;
  color: #3a8a3a !important;
  margin-top: 0.25rem;
}
```

### Step 4 — Run and test

```bash
pnpm --filter frontend dev
```

1. Without wallet connected — form shows "Connect wallet to stake"
2. Connect wallet — form becomes active
3. Switch between Stake and Unstake tabs — form clears each time
4. Try submitting empty — shows validation error
5. Enter an amount — button becomes enabled
6. Submit — button shows "Staking..." for 2 seconds then shows success with tx hash
7. Click MAX — fills in 1000

---

## What you learned in Phase 4

- Controlled inputs: React state owns the value, input displays it
- `onChange` fires on every keystroke — `e.target.value` gives the current value
- `onSubmit` on the form — always call `e.preventDefault()`
- Validation is just state — an error string, empty means valid
- Disable buttons during async operations using the `disabled` prop
- Clear related state when switching tabs (avoiding stale data)
- `type="button"` on tab buttons prevents them from submitting the form

---

## Checkpoint questions

1. What is the difference between a controlled and uncontrolled input?
2. Why do we call `e.preventDefault()` on form submit?
3. How does the "clear error as user types" pattern work?
4. Why do the tab buttons have `type="button"`?
5. Why did we clear `txHash` and `error` when switching tabs?

---

When comfortable, move to `../phase-5-context-api/LESSON.md`.
