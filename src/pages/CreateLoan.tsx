import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useLoans } from "../context/LoanContext";
import {
  PlusCircle,
  Calendar,
  User,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { getExplorerTxUrl } from "../utils/botchain";
import { shortenAddress } from "../utils/formatters";

interface CreateLoanProps {
  onLoanCreated: (loanId: string) => void;
}

export const CreateLoan: React.FC<CreateLoanProps> = ({ onLoanCreated }) => {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const {
    createLoan,
    isTxPending,
    txMessage,
    lastTxHash,
    errorMessage,
    clearStatus,
    isWrongNetwork,
    switchToBotChain,
  } = useLoans();

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [createdLoanId, setCreatedLoanId] = useState<string | null>(null);

  // Set default minimum date to 1 hour in future
  const getMinDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setCreatedLoanId(null);

    if (!itemName.trim()) return;
    if (!borrowerAddress.trim()) return;
    if (!expectedReturnDate) return;

    const returnTimestamp = Math.floor(new Date(expectedReturnDate).getTime() / 1000);

    const result = await createLoan(
      itemName.trim(),
      description.trim(),
      borrowerAddress.trim(),
      returnTimestamp
    );

    if (result.success && result.loanId) {
      setCreatedLoanId(result.loanId);
      setItemName("");
      setDescription("");
      setBorrowerAddress("");
      setExpectedReturnDate("");
    }
  };

  const handleCopyId = () => {
    if (createdLoanId) {
      navigator.clipboard.writeText(createdLoanId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Item Loan
        </h2>
        <p className="text-sm text-neutral-400">
          Record a new lending transaction with an assigned borrower on BOT Chain
        </p>
      </div>

      {/* Wallet Connection Required Banner */}
      {!isConnected ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center backdrop-blur-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Wallet Connection Required</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Connect your BOT Chain wallet (MetaMask, OKX, or WalletConnect) to authorize and sign
              loan transactions.
            </p>
          </div>
          <button
            onClick={() => open()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition active:scale-95"
          >
            Connect Wallet
          </button>
        </div>
      ) : isWrongNetwork ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-amber-200">Switch Network to BOT Chain Testnet</h3>
          <p className="text-xs text-amber-300/80 max-w-md mx-auto">
            Your wallet is connected to a different network. Please switch to BOT Chain Testnet (Chain ID 968) to proceed.
          </p>
          <button
            onClick={switchToBotChain}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition"
          >
            Switch to BOT Chain Testnet
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5"
        >
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              Item Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Clean Code Book, Sony Alpha Camera, Arduino Kit"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder:text-neutral-600 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Short Description / Condition
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Includes original hardcover and bookmark. Lent in pristine condition."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder:text-neutral-600 transition resize-none"
            />
          </div>

          {/* Borrower Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-400" />
              Borrower Wallet Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              value={borrowerAddress}
              onChange={(e) => setBorrowerAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white font-mono text-sm placeholder:text-neutral-600 transition"
            />
            <p className="mt-1.5 text-[11px] text-neutral-500">
              Only this designated wallet address will be able to confirm receipt and verify the item return.
            </p>
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Expected Return Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              required
              min={getMinDateTime()}
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-white text-sm transition calendar-picker-indicator"
            />
          </div>

          {/* Connected Lender Notice */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs flex items-center justify-between">
            <span className="text-neutral-400">Lender (Connected Wallet):</span>
            <span className="font-mono text-sky-400">{shortenAddress(address)}</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isTxPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            {isTxPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording Loan on BOT Chain...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Create & Sign Loan Transaction</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Transaction Feedback */}
      {isTxPending && txMessage && (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 flex items-center gap-3 animate-in fade-in">
          <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
          <div className="text-xs sm:text-sm text-sky-200">
            <p className="font-semibold">Transaction in Progress</p>
            <p className="text-sky-300/80 mt-0.5">{txMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-200">
            <p className="font-semibold">Transaction Failed</p>
            <p className="text-rose-300/80 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Creation Success Banner */}
      {createdLoanId && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-200">
                Loan Successfully Created on BOT Chain!
              </h4>
              <p className="text-xs text-emerald-300/80">
                The loan record is now confirmed and stored immutably on-chain.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Unique Loan ID:</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-neutral-200 break-all select-all">
              {createdLoanId}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {lastTxHash && (
              <a
                href={getExplorerTxUrl(lastTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium underline underline-offset-2"
              >
                View on BohrScan
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onLoanCreated(createdLoanId)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
            >
              View Loan Details →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
