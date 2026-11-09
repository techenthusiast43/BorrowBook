# BorrowBook – BOT Chain dApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: BOT Chain](https://img.shields.io/badge/Network-BOT%20Chain%20(968)-0284c7)](https://scan.bohr.life)
[![Solidity: 0.8.20](https://img.shields.io/badge/Solidity-0.8.20-363636)](https://soliditylang.org/)
[![React: 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

BorrowBook is a modern, responsive decentralized application (dApp) that allows users to record items they lend to other wallet addresses, track borrowing status in real-time, and maintain an immutable, auditable borrowing history on **BOT Chain**.

---

## 🌐 Official BOT Chain Network Specifications

Following official developer documentation, the dApp is preconfigured with the official network parameters:

### **BOT Chain Testnet (Bohr)**
* **Network Name:** BOT Chain Testnet
* **Chain ID:** `968` (`0x3c8`)
* **RPC URL:** `https://rpc.bohr.life`
* **Native Token / Symbol:** `BOT` (or `tBOT`)
* **Total Supply:** 150 Million
* **Block Explorer:** [https://scan.bohr.life/](https://scan.bohr.life/)

### **BOT Chain Mainnet**
* **Network Name:** BOT Chain
* **Chain ID:** `677` (`0x2a5`)
* **RPC URL:** `https://rpc.botchain.ai`
* **Native Token / Symbol:** `BOT`
* **Block Explorer:** [https://scan.botchain.ai/](https://scan.botchain.ai/)

---

## 🛠️ Technology Stack

* **Smart Contracts:** Solidity `^0.8.20`, Hardhat, Ethers.js v6
* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS (Modern dark Web3 interface)
* **Web3 Integration:**
  * Reown AppKit (`@reown/appkit`, `@reown/appkit-adapter-wagmi`)
  * Wagmi v2 (`wagmi@2.x`)
  * Viem (`viem`)
  * TanStack Query (`@tanstack/react-query`)
  * Ethers.js (`ethers@6.x`)
* **Icons:** Lucide React

---

## 📜 Smart Contract Architecture (`contracts/BorrowBook.sol`)

### **Loan Lifecycle & State Machine**

```
                 [ createLoan() ]
                        │
                        ▼
                AwaitingBorrower
                  │           │
 [ cancelLoan() ] │           │ [ confirmBorrowing() ]
   (by Lender)    ▼           ▼
              Cancelled    Borrowed
                              │
                              │ [ markReturned() ] (by Lender)
                              ▼
                        ReturnPending
                              │
                              │ [ confirmReturn() ] (by Borrower)
                              ▼
                           Returned
```

### **Contract Methods**

1. **`createLoan(bytes32 loanId, address borrower, string itemName, string description, uint256 expectedReturnDate)`**
   * Only the lender can create a loan.
   * Validates non-empty `loanId`, non-zero `borrower`, `borrower != msg.sender` (prevents self-lending), non-empty `itemName`, and `expectedReturnDate > block.timestamp`.
   * Enforces uniqueness (reverts on duplicate `loanId`).
   * Emits `LoanCreated`.

2. **`confirmBorrowing(bytes32 loanId)`**
   * Only the assigned `borrower` can call this.
   * Requires status `AwaitingBorrower`.
   * Transitions loan to `Borrowed`.
   * Emits `BorrowingConfirmed`.

3. **`markReturned(bytes32 loanId)`**
   * Only the original `lender` can initiate the return workflow.
   * Requires status `Borrowed`.
   * Transitions loan to `ReturnPending`.
   * Emits `ReturnInitiated`.

4. **`confirmReturn(bytes32 loanId)`**
   * Only the assigned `borrower` can finalize the return.
   * Requires status `ReturnPending`.
   * Transitions loan to `Returned` (terminal state) and sets `returnedAt` timestamp.
   * Emits `ReturnConfirmed`.

5. **`cancelLoan(bytes32 loanId)`**
   * Only the original `lender` can cancel.
   * Allowed strictly while `AwaitingBorrower` (before the borrower confirms receipt).
   * Transitions loan to `Cancelled` (terminal state).
   * Emits `LoanCancelled`.

6. **`getLoan(bytes32 loanId)`**
   * Returns complete loan record: `(lender, borrower, createdAt, expectedReturnDate, returnedAt, status, itemName, description)`.

7. **Index & Query Helpers**
   * `getTotalLoansCount()`: Returns total registered loans count.
   * `getAllLoanIds()`: Returns array of all loan IDs.
   * `getLenderLoans(address lender)`: Returns loan IDs created by a lender.
   * `getBorrowerLoans(address borrower)`: Returns loan IDs assigned to a borrower.

---

## 🔒 Security & Verification Guarantees

* **Zero Private Key Requests:** The dApp never requests or touches private keys or seed phrases.
* **Strict Role Enforcement:** Unauthorized callers attempting any status transitions revert with custom errors (`Unauthorized()`, `InvalidStateTransition()`).
* **Terminal Immutability:** Returned and Cancelled loans cannot be reused, modified, or transitioned again.
* **Storage Optimization:** Timestamps are packed into `uint64` and statuses into `uint8` (`LoanStatus`) to minimize gas consumption on BOT Chain.
* **Transaction Finality:** UI awaits on-chain block receipt confirmation (`tx.wait(1)`) before declaring success.

---

## 🧪 Unit Tests

The test suite covers 100% of contract logic across 24 test cases including unauthorized callers, duplicate IDs, self-lending prevention, and invalid state transitions.

Run the tests:

```bash
npx hardhat test
```

### Test Output Preview:
```
  BorrowBook Smart Contract Unit Tests
    1. Deployment
      √ should initialize with zero loans
    2. Loan Creation (createLoan)
      √ should create a loan successfully and emit LoanCreated event
      √ should reject creation with empty loan ID
      √ should reject duplicate loan ID
      √ should reject zero address borrower
      √ should reject self-lending (lender == borrower)
      √ should reject empty item name
      √ should reject past or current return date
    3. Borrowing Confirmation (confirmBorrowing)
      √ should allow designated borrower to confirm receipt
      √ should reject confirmation by lender or third party
      √ should reject confirming non-existent loan
      √ should reject confirming an already borrowed loan
    4. Return Initiation (markReturned)
      √ should reject markReturned before borrower confirms receipt
      √ should allow lender to mark as returned once borrowed
      √ should reject markReturned from non-lender
    5. Return Confirmation (confirmReturn)
      √ should reject confirmReturn if return has not been initiated
      √ should allow borrower to confirm return when ReturnPending
      √ should reject confirmReturn by unauthorized party
      √ should prevent returned loans from being reused or modified
    6. Loan Cancellation (cancelLoan)
      √ should allow lender to cancel unconfirmed loan
      √ should reject cancellation by borrower or third party
      √ should reject cancellation after borrower has confirmed borrowing
      √ should prevent cancelled loan from being confirmed
    7. Index Tracking & Queries
      √ should track loans per lender and borrower

  24 passing (2s)
```

---

## 🚀 Deployment Instructions

### 1. Set Deployer Private Key

Create a `.env` file in the project root:

```env
DEPLOYER_PRIVATE_KEY=your_private_key_here_without_quotes
```

### 2. Deploy to BOT Chain Testnet

```bash
npx hardhat run scripts/deploy.cjs --network botchainTestnet
```

The deployment script:
1. Connects to `https://rpc.bohr.life` (Chain ID 968).
2. Deploys the `BorrowBook` contract.
3. Automatically exports the contract address and network metadata to `src/contracts/deployedAddress.json`.
4. Outputs the direct BohrScan transaction URL.

### 3. Deploy to BOT Chain Mainnet

```bash
npx hardhat run scripts/deploy.cjs --network botchainMainnet
```

---

## 💻 Running the Frontend

### 1. Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 2. Production Build

```bash
npm run build
```

The production output is placed in `dist/`.

### 3. Preview Production Build

```bash
npm run preview
```

---

## 📱 Application Pages

1. **Dashboard:**
   * Global metrics: Total Loans, Active Loans, Returned Loans, Overdue Loans.
   * Quick action button to create a loan.
   * Recent borrowing activity feed with live status badges and BohrScan explorer links.

2. **Create Loan:**
   * Wallet connection check with automatic network switch helper.
   * Input fields for item name, description, borrower wallet address, and expected return deadline.
   * Collision-resistant `bytes32` Loan ID generator with 1-click copy.
   * Step-by-step transaction state: *Preparing → Wallet Signature → Confirming on BOT Chain → Confirmed*.

3. **My Lending:**
   * Filter and search loans created by the connected wallet.
   * Contextual action: **Cancel Loan** (if unconfirmed by borrower).
   * Contextual action: **Mark as Returned** (if item is currently borrowed).

4. **My Borrowing:**
   * Filter and search loans where the connected wallet is the borrower.
   * Contextual action: **Confirm Receipt** (confirming possession).
   * Contextual action: **Confirm Return Completed** (when return is initiated).

5. **Loan Details:**
   * Direct search by `bytes32` Loan ID.
   * Full timeline, involved wallet addresses, terms, and status badges.
   * Direct links to BohrScan block explorer (`https://scan.bohr.life/tx/...` & `/address/...`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
