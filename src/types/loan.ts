export enum LoanStatus {
  None = 0,
  AwaitingBorrower = 1,
  Borrowed = 2,
  ReturnPending = 3,
  Returned = 4,
  Cancelled = 5,
}

export interface LoanRecord {
  loanId: `0x${string}`;
  lender: `0x${string}`;
  borrower: `0x${string}`;
  createdAt: number;
  expectedReturnDate: number;
  returnedAt: number;
  status: LoanStatus;
  itemName: string;
  description: string;
}

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
}

