import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  BookOpen,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Wallet,
  AlertTriangle,
  Settings,
  ExternalLink,
} from "lucide-react";
import { shortenAddress } from "../utils/formatters";
import { useLoans } from "../context/LoanContext";
import { botchainTestnet } from "../utils/botchain";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettingsModal,
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { isWrongNetwork, switchToBotChain, contractAddress } = useLoans();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen },
    { id: "create", label: "Create Loan", icon: PlusCircle },
    { id: "lending", label: "My Lending", icon: ArrowUpRight },
    { id: "borrowing", label: "My Borrowing", icon: ArrowDownLeft },
    { id: "details", label: "Loan Details", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      {/* Wrong Network Banner */}
      {isWrongNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You are connected to an unsupported network. Please switch to{" "}
              <strong>BOT Chain Testnet (Chain ID: 968)</strong> to interact with BorrowBook.
            </span>
          </div>
          <button
            onClick={switchToBotChain}
            className="ml-4 px-3 py-1 rounded bg-amber-500 text-neutral-950 font-medium hover:bg-amber-400 transition"
          >
            Switch Network
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  BorrowBook
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    BOT Chain
                  </span>
                </span>
                <span className="text-xs text-neutral-400 block -mt-0.5">
                  Decentralized Lending Tracker
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-neutral-800 text-white shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : ""}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* BOT Chain Testnet Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-300 font-medium">BOT Testnet</span>
              <span className="text-neutral-500">ID: {botchainTestnet.id}</span>
            </div>

            {/* Contract Configuration Button */}
            <button
              onClick={openSettingsModal}
              title="Smart Contract Configuration"
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Wallet Connect Button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-sm font-medium text-neutral-200 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{shortenAddress(address)}</span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-rose-500/10 border border-neutral-800 hover:border-rose-500/30 text-xs text-neutral-400 hover:text-rose-400 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => open()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition transform active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-neutral-800/80 -mx-4 px-4 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
