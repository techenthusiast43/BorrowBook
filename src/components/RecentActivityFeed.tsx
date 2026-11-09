import React from "react";
import { LoanRecord } from "../types/loan";
import { formatDate, formatRelativeTime, shortenAddress, formatLoanId } from "../utils/formatters";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { ArrowRight, Clock, ExternalLink } from "lucide-react";
import { getExplorerAddressUrl } from "../utils/botchain";

interface RecentActivityFeedProps {
  loans: LoanRecord[];
  onSelectLoan: (loanId: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  loans,
  onSelectLoan,
}) => {
  if (loans.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center backdrop-blur-sm">
        <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-neutral-300">No Recent Activity</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          No loan records found on the connected BOT Chain smart contract. Be the first to create a lending record!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-base font-bold text-white">Recent Borrowing Activity</h3>
        </div>
        <span className="text-xs text-neutral-400 font-medium">
          Showing {Math.min(loans.length, 5)} latest
        </span>
      </div>

      <div className="divide-y divide-neutral-800/60">
        {loans.slice(0, 5).map((loan) => (
          <div
            key={loan.loanId}
            onClick={() => onSelectLoan(loan.loanId)}
            className="p-4 hover:bg-neutral-800/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 font-bold text-sm shrink-0 group-hover:border-sky-500/40 group-hover:text-sky-400 transition">
                {loan.itemName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm group-hover:text-sky-300 transition">
                    {loan.itemName}
                  </span>
                  <LoanStatusBadge
                    status={loan.status}
                    expectedReturnDate={loan.expectedReturnDate}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 flex-wrap">
                  <span>Lender:</span>
                  <a
                    href={getExplorerAddressUrl(loan.lender)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-neutral-300 hover:text-sky-400 font-mono transition"
                  >
                    {shortenAddress(loan.lender)}
                  </a>
                  <span className="text-neutral-600">→</span>
                  <span>Borrower:</span>
                  <a
                    href={getExplorerAddressUrl(loan.borrower)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-neutral-300 hover:text-sky-400 font-mono transition"
                  >
                    {shortenAddress(loan.borrower)}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-neutral-400">
              <div className="text-right">
                <span className="block text-neutral-300 font-medium">
                  {formatRelativeTime(loan.createdAt)}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Due: {formatDate(loan.expectedReturnDate)}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-neutral-800/60 text-neutral-400 group-hover:text-sky-400 group-hover:bg-neutral-700/60 transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
