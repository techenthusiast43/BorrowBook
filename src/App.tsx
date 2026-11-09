import React, { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config/wagmi";
import { LoanProvider } from "./context/LoanContext";
import { Navbar } from "./components/Navbar";
import { ContractAddressModal } from "./components/ContractAddressModal";
import { Dashboard } from "./pages/Dashboard";
import { CreateLoan } from "./pages/CreateLoan";
import { MyLending } from "./pages/MyLending";
import { MyBorrowing } from "./pages/MyBorrowing";
import { LoanDetails } from "./pages/LoanDetails";
import { botchainTestnet } from "./utils/botchain";
import { ExternalLink, ShieldCheck } from "lucide-react";

const queryClient = new QueryClient();

function MainContent() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleSelectLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setActiveTab("details");
  };

  const handleLoanCreated = (loanId: string) => {
    setSelectedLoanId(loanId);
    setActiveTab("details");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettingsModal={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLoan={handleSelectLoan}
          />
        )}

        {activeTab === "create" && (
          <CreateLoan onLoanCreated={handleLoanCreated} />
        )}

        {activeTab === "lending" && (
          <MyLending
            onSelectLoan={handleSelectLoan}
            onCreateLoanClick={() => setActiveTab("create")}
          />
        )}

        {activeTab === "borrowing" && (
          <MyBorrowing
            onSelectLoan={handleSelectLoan}
            onExploreClick={() => setActiveTab("dashboard")}
          />
        )}

        {activeTab === "details" && (
          <LoanDetails initialLoanId={selectedLoanId} />
        )}
      </main>

      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
            <span className="font-semibold text-neutral-300">BorrowBook</span>
            <span>—</span>
            <span>Decentralized Item Lending Tracker on BOT Chain</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 flex items-center gap-1 transition"
            >
              BohrScan Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 flex items-center gap-1 transition"
            >
              RPC Endpoint
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-neutral-600">Chain ID: {botchainTestnet.id}</span>
          </div>
        </div>
      </footer>

      <ContractAddressModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <LoanProvider>
          <MainContent />
        </LoanProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
