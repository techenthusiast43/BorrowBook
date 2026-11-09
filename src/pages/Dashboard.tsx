import React from "react";
import { useLoans } from "../context/LoanContext";
import { StatCard } from "../components/StatCard";
import { RecentActivityFeed } from "../components/RecentActivityFeed";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertOctagon,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { botchainTestnet, getExplorerAddressUrl } from "../utils/botchain";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectLoan: (loanId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectLoan,
}) => {
  const { stats, loans, isLoading, refreshLoans, contractAddress } = useLoans();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-sky-950/40 border border-neutral-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            BOT Chain Smart Contract Secured
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Decentralized Peer-to-Peer{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Item Lending
            </span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Record items lent to friends or colleagues, manage return deadlines, and preserve an
            immutable, auditable borrowing history on BOT Chain.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Loan
            </button>
            <button
              onClick={() => onNavigate("lending")}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 font-medium text-sm border border-neutral-700 transition"
            >
              My Lending Records
            </button>
            <button
              onClick={() => refreshLoans()}
              disabled={isLoading}
              title="Refresh on-chain data"
              className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700/60 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Abstract Glow Background */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Loans"
          value={stats.totalLoans}
          icon={BookOpen}
          description="All loans registered on-chain"
          colorScheme="blue"
        />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={Clock}
          description="Currently borrowed or awaiting borrower"
          colorScheme="amber"
        />
        <StatCard
          title="Returned Loans"
          value={stats.returnedLoans}
          icon={CheckCircle2}
          description="Safely returned and finalized"
          colorScheme="emerald"
        />
        <StatCard
          title="Overdue Loans"
          value={stats.overdueLoans}
          icon={AlertOctagon}
          description="Exceeded expected return timestamp"
          colorScheme="rose"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <RecentActivityFeed loans={loans} onSelectLoan={onSelectLoan} />
      </div>

      {/* Chain Status Bar */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Contract deployed on <strong>{botchainTestnet.name}</strong></span>
          <span className="text-neutral-600">|</span>
          <span className="font-mono text-neutral-300">{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</span>
        </div>
        <a
          href={getExplorerAddressUrl(contractAddress, botchainTestnet.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition"
        >
          Inspect Contract on BohrScan
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

