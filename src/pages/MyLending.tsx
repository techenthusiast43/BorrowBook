import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
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
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getExplorerAddressUrl, getExplorerTxUrl } from "../utils/botchain";

interface MyLendingProps {
  onSelectLoan: (loanId: string) => void;
  onCreateLoanClick: () => void;
}

export const MyLending: React.FC<MyLendingProps> = ({
  onSelectLoan,
  onCreateLoanClick,
}) => {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const {
    lendingLoans,
    markReturned,
    cancelLoan,
    isTxPending,
    txMessage,
    lastTxHash,
    errorMessage,
    clearStatus,
  } = useLoans();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const filteredLoans = lendingLoans.filter((loan) => {
    const matchesSearch =
      loan.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "awaiting") return loan.status === LoanStatus.AwaitingBorrower;
    if (statusFilter === "borrowed") return loan.status === LoanStatus.Borrowed;
    if (statusFilter === "returnPending") return loan.status === LoanStatus.ReturnPending;
    if (statusFilter === "returned") return loan.status === LoanStatus.Returned;
    if (statusFilter === "cancelled") return loan.status === LoanStatus.Cancelled;
    if (statusFilter === "overdue") return isOverdue(loan.expectedReturnDate, loan.status);

    return true;
  });

  const handleMarkReturned = async (loanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveActionId(loanId);
    await markReturned(loanId);
    setActiveActionId(null);
  };

  const handleCancelLoan = async (loanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveActionId(loanId);
    await cancelLoan(loanId);
    setActiveActionId(null);
  };

  if (!isConnected) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center backdrop-blur-sm space-y-4">
        <ArrowUpRight className="w-12 h-12 text-sky-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Connect Wallet to View Lending Records</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Please connect your BOT Chain wallet to see items you have lent and manage return workflows.
        </p>
        <button
          onClick={() => open()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition active:scale-95"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-sky-400" />
            My Lending Records
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage items you have lent to other wallet addresses on BOT Chain ({lendingLoans.length} total)
          </p>
        </div>

        <button
          onClick={onCreateLoanClick}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition"
        >
          + Lend New Item
        </button>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, borrower address, or loan ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white text-xs placeholder:text-neutral-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs focus:border-sky-500 focus:outline-none transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="awaiting">Awaiting Borrower</option>
            <option value="borrowed">Borrowed (Active)</option>
            <option value="returnPending">Return Pending</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Loan Table / Cards */}
      {filteredLoans.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center backdrop-blur-sm space-y-3">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto" />
          <h4 className="text-sm font-semibold text-neutral-300">No Lending Records Found</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No records matched your search or status filter."
              : "You haven't lent any items yet. Create your first loan to start tracking!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => {
            const overdue = isOverdue(loan.expectedReturnDate, loan.status);
            const isProcessing = isTxPending && activeActionId === loan.loanId;

            return (
              <div
                key={loan.loanId}
                onClick={() => onSelectLoan(loan.loanId)}
                className="group rounded-2xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition line-clamp-1">
                        {loan.itemName}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {loan.description || "No description provided."}
                      </p>
                    </div>
                    <LoanStatusBadge
                      status={loan.status}
                      expectedReturnDate={loan.expectedReturnDate}
                    />
                  </div>

                  <div className="space-y-2 py-3 border-y border-neutral-800/80 text-xs text-neutral-300">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Borrower:</span>
                      <a
                        href={getExplorerAddressUrl(loan.borrower)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        {shortenAddress(loan.borrower)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Expected Return:
                      </span>
                      <span className={overdue ? "text-rose-400 font-semibold" : "text-neutral-200"}>
                        {formatDate(loan.expectedReturnDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Created:</span>
                      <span className="text-neutral-400">{formatRelativeTime(loan.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Contextual Action Buttons */}
                <div className="pt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-neutral-500">
                    ID: {formatLoanId(loan.loanId)}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* If Awaiting Borrower, lender can cancel */}
                    {loan.status === LoanStatus.AwaitingBorrower && (
                      <button
                        onClick={(e) => handleCancelLoan(loan.loanId, e)}
                        disabled={isTxPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-xs font-semibold border border-neutral-700 hover:border-rose-500/30 transition disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Cancel Loan
                      </button>
                    )}

                    {/* If Borrowed, lender can mark as returned */}
                    {loan.status === LoanStatus.Borrowed && (
                      <button
                        onClick={(e) => handleMarkReturned(loan.loanId, e)}
                        disabled={isTxPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Mark as Returned
                      </button>
                    )}

                    {loan.status === LoanStatus.ReturnPending && (
                      <span className="text-xs text-purple-400 italic">
                        Awaiting borrower confirmation
                      </span>
                    )}

                    {loan.status === LoanStatus.Returned && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

