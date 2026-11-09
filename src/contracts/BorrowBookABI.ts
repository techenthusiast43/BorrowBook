export const BorrowBookABI = [
  {
    "type": "function",
    "name": "createLoan",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "borrower", "type": "address", "internalType": "address" },
      { "name": "itemName", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "expectedReturnDate", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "confirmBorrowing",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "markReturned",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "confirmReturn",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelLoan",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getLoan",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [
      { "name": "lender", "type": "address", "internalType": "address" },
      { "name": "borrower", "type": "address", "internalType": "address" },
      { "name": "createdAt", "type": "uint64", "internalType": "uint64" },
      { "name": "expectedReturnDate", "type": "uint64", "internalType": "uint64" },
      { "name": "returnedAt", "type": "uint64", "internalType": "uint64" },
      { "name": "status", "type": "uint8", "internalType": "enum BorrowBook.LoanStatus" },
      { "name": "itemName", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalLoansCount",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllLoanIds",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bytes32[]", "internalType": "bytes32[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLenderLoans",
    "inputs": [{ "name": "lender", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bytes32[]", "internalType": "bytes32[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBorrowerLoans",
    "inputs": [{ "name": "borrower", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bytes32[]", "internalType": "bytes32[]" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "LoanCreated",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "lender", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "itemName", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "description", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "expectedReturnDate", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "createdAt", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BorrowingConfirmed",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReturnInitiated",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "lender", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReturnConfirmed",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "borrower", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoanCancelled",
    "inputs": [
      { "name": "loanId", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "lender", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  { "type": "error", "name": "InvalidLoanId", "inputs": [] },
  { "type": "error", "name": "DuplicateLoanId", "inputs": [] },
  { "type": "error", "name": "LoanDoesNotExist", "inputs": [] },
  { "type": "error", "name": "InvalidBorrowerAddress", "inputs": [] },
  { "type": "error", "name": "SelfLendingNotAllowed", "inputs": [] },
  { "type": "error", "name": "EmptyItemName", "inputs": [] },
  { "type": "error", "name": "InvalidExpectedReturnDate", "inputs": [] },
  { "type": "error", "name": "Unauthorized", "inputs": [] },
  {
    "type": "error",
    "name": "InvalidStateTransition",
    "inputs": [
      { "name": "currentStatus", "type": "uint8", "internalType": "enum BorrowBook.LoanStatus" },
      { "name": "requiredStatus", "type": "uint8", "internalType": "enum BorrowBook.LoanStatus" }
    ]
  }
] as const;
