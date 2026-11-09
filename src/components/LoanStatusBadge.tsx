import React from "react";
import { LoanStatus } from "../types/loan";
import { getStatusBadgeClasses, getStatusLabel, isOverdue } from "../utils/formatters";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  expectedReturnDate?: number | bigint;
  showOverdueFlag?: boolean;
}

export const LoanStatusBadge: React.FC<LoanStatusBadgeProps> = ({
  status,
  expectedReturnDate,
  showOverdueFlag = true,
}) => {
  const overdue = showOverdueFlag && expectedReturnDate ? isOverdue(expectedReturnDate, status) : false;
  const label = overdue ? "Overdue" : getStatusLabel(status);
  const classes = getStatusBadgeClasses(status, overdue);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${classes}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          overdue
            ? "bg-rose-400 animate-ping"
            : status === LoanStatus.Borrowed
            ? "bg-sky-400"
            : status === LoanStatus.AwaitingBorrower
            ? "bg-amber-400"
            : status === LoanStatus.ReturnPending
            ? "bg-purple-400 animate-pulse"
            : status === LoanStatus.Returned
            ? "bg-emerald-400"
            : "bg-neutral-400"
        }`}
      />
      {label}
    </span>
  );
};
