import { LoanStatus } from "../types/loan";

export function shortenAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestampInSeconds: number | bigint): string {
  const ts = Number(timestampInSeconds) * 1000;
  if (!ts || isNaN(ts)) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function formatRelativeTime(timestampInSeconds: number | bigint): string {
  const ts = Number(timestampInSeconds) * 1000;
  if (!ts || isNaN(ts)) return "";
  const now = Date.now();
  const diffSec = Math.floor((now - ts) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function isOverdue(expectedReturnDate: number | bigint, status: LoanStatus): boolean {
  if (status === LoanStatus.Returned || status === LoanStatus.Cancelled || status === LoanStatus.None) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return Number(expectedReturnDate) < now;
}

export function getStatusLabel(status: LoanStatus): string {
  switch (status) {
    case LoanStatus.AwaitingBorrower:
      return "Awaiting Borrower";
    case LoanStatus.Borrowed:
      return "Borrowed";
    case LoanStatus.ReturnPending:
      return "Return Pending";
    case LoanStatus.Returned:
      return "Returned";
    case LoanStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function getStatusBadgeClasses(status: LoanStatus, overdue: boolean = false): string {
  if (overdue) {
    return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
  }
  switch (status) {
    case LoanStatus.AwaitingBorrower:
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case LoanStatus.Borrowed:
      return "bg-sky-500/15 text-sky-400 border border-sky-500/30";
    case LoanStatus.ReturnPending:
      return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
    case LoanStatus.Returned:
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case LoanStatus.Cancelled:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
    default:
      return "bg-neutral-800 text-neutral-400 border border-neutral-700";
  }
}

export function formatLoanId(loanId: string): string {
  if (!loanId) return "";
  if (loanId.startsWith("0x") && loanId.length === 66) {
    return `${loanId.slice(0, 8)}...${loanId.slice(-6)}`;
  }
  return loanId;
}

