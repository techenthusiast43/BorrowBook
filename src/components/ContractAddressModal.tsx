import React, { useState } from "react";
import { X, Check, RefreshCw, ExternalLink, ShieldCheck, Database } from "lucide-react";
import { useLoans } from "../context/LoanContext";
import { botchainTestnet, DEFAULT_CONTRACT_ADDRESS, getExplorerAddressUrl } from "../utils/botchain";
import { ethers } from "ethers";

interface ContractAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractAddressModal: React.FC<ContractAddressModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { contractAddress, setContractAddress, refreshLoans } = useLoans();
  const [inputAddress, setInputAddress] = useState(contractAddress);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setError(null);
    if (!ethers.isAddress(inputAddress)) {
      setError("Please enter a valid Ethereum-compatible contract address.");
      return;
    }
    setContractAddress(inputAddress);
    setSaved(true);
    refreshLoans();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setInputAddress(DEFAULT_CONTRACT_ADDRESS);
    setContractAddress(DEFAULT_CONTRACT_ADDRESS);
    setSaved(true);
    refreshLoans();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Smart Contract Configuration</h3>
            <p className="text-xs text-neutral-400">
              Manage the BorrowBook contract connection on BOT Chain
            </p>
          </div>
        </div>

        {/* Network Info Callout */}
        <div className="mb-5 rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Target Network:</span>
            <span className="font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {botchainTestnet.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Chain ID:</span>
            <span className="font-mono">{botchainTestnet.id}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Official RPC:</span>
            <span className="font-mono text-neutral-400">https://rpc.bohr.life</span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Native Token:</span>
            <span className="font-mono">BOT</span>
          </div>
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-500">Block Explorer:</span>
            <a
              href={getExplorerAddressUrl(contractAddress, botchainTestnet.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline underline-offset-2"
            >
              View on BohrScan
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
              BorrowBook Contract Address
            </label>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => {
                setInputAddress(e.target.value);
                setError(null);
              }}
              placeholder="0x..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-sky-500 focus:outline-none text-neutral-100 font-mono text-sm placeholder:text-neutral-600 transition"
            />
            {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save & Reload"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
