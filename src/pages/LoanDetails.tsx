import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useLoans } from "../context/LoanContext";
import { LoanRecord, LoanStatus } from "../types/loan";
import { LoanStatusBadge } from "../components/LoanStatusBadge";
import {
  formatDate,
  formatRelativeTime,
  shortenAddress,
  formatLoanId,
  isOverdue,
} from "../utils/formatters";
import {
  Search,
  ExternalLink,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  PackageCheck,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { botchainTestnet, getExplorerAddressUrl, getExplorerTxUrl } from "../utils/botchain";

interface LoanDetailsProps {
  initialLoanId?: string | null;
  onBack?: () => void;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({
  initialLoanId,
  onBack,
}) => {
  const { address } = useAccount();
  const {
    loans,
    fetchSingleLoan,
    confirmBorrowing,
    markReturned,
    confirmReturn,
    cancelLoan,
    isTxPending,
    txMessage,
    errorMessage,
    clearStatus,
  } = useLoans();

  const [searchId, setSearchId] = useState<string>(initialLoanId || "");
  const [currentLoan, setCurrentLoan] = useState<LoanRecord | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialLoanId) {
      setSearchId(initialLoanId);
      loadLoan(initialLoanId);
    } else if (loans.length > 0) {
      setCurrentLoan(loans[0]);
      setSearchId(loans[0].loanId);
    }
  }, [initialLoanId, loans]);

  const loadLoan = async (id: string) => {
    if (!id.trim()) return;
    setSearchError(null);
    clearStatus();

    // Check in existing list first
    const existing = loans.find(
      (l) => l.loanId.toLowerCase() === id.trim().toLowerCase()
    );
    if (existing) {
      setCurrentLoan(existing);
      return;
    }

    // Query on-chain
    setIsSearching(true);
    try {
      const loan = await fetchSingleLoan(id.trim());
      if (loan) {
        setCurrentLoan(loan);
      } else {
        setSearchError("No loan found with this Loan ID on the connected BOT Chain smart contract.");
        setCurrentLoan(null);
      }
    } catch {
      setSearchError("Failed to fetch loan details. Please check the Loan ID format.");
      setCurrentLoan(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLoan(searchId);
  };

  const handleCopyId = () => {
    if (currentLoan) {
      navigator.clipboard.writeText(currentLoan.loanId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userAddress = address?.toLowerCase();
  const isLender = currentLoan && userAddress === currentLoan.lender.toLowerCase();
  const isBorrower = currentLoan && userAddress === currentLoan.borrower.toLowerCase();
  const overdue = currentLoan ? isOverdue(currentLoan.expectedReturnDate, currentLoan.status) : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            Inspect Loan Record
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Search by unique bytes32 Loan ID to verify on-chain lending status, terms, and parties
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Paste bytes32 loan ID (0x...)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white font-mono text-xs placeholder:text-neutral-600 transition"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Lookup
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {searchError}
          </p>
        )}
      </div>

      {/* Transaction Notifications */}
      {isTxPending && txMessage && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 flex items-center gap-3 animate-in fade-in text-xs text-sky-200">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
          <span>{txMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between gap-3 animate-in fade-in text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={clearStatus} className="text-rose-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loan Details View */}
      {currentLoan && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
          {/* Top Title & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Lent Item
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">{currentLoan.itemName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <LoanStatusBadge
                status={currentLoan.status}
                expectedReturnDate={currentLoan.expectedReturnDate}
              />
            </div>
          </div>

          {/* Loan ID Display */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs">
              <span className="text-neutral-500 block">Loan ID (bytes32):</span>
              <span className="font-mono text-neutral-200 break-all select-all">
                {currentLoan.loanId}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          {currentLoan.description && (
            <div>
              <span className="text-xs font-semibold uppercase text-neutral-400 block mb-1">
                Description & Terms
              </span>
              <p className="text-sm text-neutral-300 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60 leading-relaxed">
                {currentLoan.description}
              </p>
            </div>
          )}

          {/* Timeline / Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Created At
              </span>
              <span className="text-sm font-semibold text-white">
                {formatDate(currentLoan.createdAt)}
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                ({formatRelativeTime(currentLoan.createdAt)})
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Expected Return
              </span>
              <span
                className={`text-sm font-semibold ${
                  overdue ? "text-rose-400" : "text-white"
                }`}
              >
                {formatDate(currentLoan.expectedReturnDate)}
              </span>
              {overdue && (
                <span className="text-[11px] text-rose-400 block mt-0.5 font-medium">
                  Return past deadline
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Returned At
              </span>
              <span className="text-sm font-semibold text-white">
                {currentLoan.returnedAt > 0 ? formatDate(currentLoan.returnedAt) : "Pending"}
              </span>
            </div>
          </div>

          {/* Involved Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-medium">Lender Address</span>
                {isLender && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    You (Lender)
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-200 break-all select-all">
                {currentLoan.lender}
              </p>
              <a
                href={getExplorerAddressUrl(currentLoan.lender)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 pt-1"
              >
                View on BohrScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-medium">Borrower Address</span>
                {isBorrower && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    You (Borrower)
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-200 break-all select-all">
                {currentLoan.borrower}
              </p>
              <a
                href={getExplorerAddressUrl(currentLoan.borrower)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 pt-1"
              >
                View on BohrScan
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Contextual Action Bar */}
          <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-neutral-400">
              Network: <strong>{botchainTestnet.name}</strong> (Chain ID: {botchainTestnet.id})
            </span>

            <div className="flex items-center gap-2">
              {/* Lender: Cancel if Awaiting Borrower */}
              {isLender && currentLoan.status === LoanStatus.AwaitingBorrower && (
                <button
                  onClick={() => cancelLoan(currentLoan.loanId)}
                  disabled={isTxPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Loan
                </button>
              )}

              {/* Borrower: Confirm Receipt if Awaiting Borrower */}
              {isBorrower && currentLoan.status === LoanStatus.AwaitingBorrower && (
                <button
                  onClick={() => confirmBorrowing(currentLoan.loanId)}
                  disabled={isTxPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  Confirm Receipt
                </button>
              )}

              {/* Lender: Mark Returned if Borrowed */}
              {isLender && currentLoan.status === LoanStatus.Borrowed && (
                <button
                  onClick={() => markReturned(currentLoan.loanId)}
                  disabled={isTxPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Returned
                </button>
              )}

              {/* Borrower: Confirm Return if Return Pending */}
              {isBorrower && currentLoan.status === LoanStatus.ReturnPending && (
                <button
                  onClick={() => confirmReturn(currentLoan.loanId)}
                  disabled={isTxPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Return Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

