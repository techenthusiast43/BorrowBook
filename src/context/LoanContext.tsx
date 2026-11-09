import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ethers } from "ethers";
import { BorrowBookABI } from "../contracts/BorrowBookABI";
import { LoanRecord, LoanStatus, LoanStats } from "../types/loan";
import {
  botchainTestnet,
  DEFAULT_CONTRACT_ADDRESS,
  getExplorerTxUrl,
} from "../utils/botchain";
import { generateLoanId } from "../utils/idGenerator";

interface LoanContextType {
  contractAddress: string;
  setContractAddress: (addr: string) => void;
  loans: LoanRecord[];
  stats: LoanStats;
  lendingLoans: LoanRecord[];
  borrowingLoans: LoanRecord[];
  isLoading: boolean;
  isTxPending: boolean;
  txMessage: string | null;
  lastTxHash: string | null;
  errorMessage: string | null;
  clearStatus: () => void;
  refreshLoans: () => Promise<void>;
  createLoan: (
    itemName: string,
    description: string,
    borrower: string,
    expectedReturnTimestamp: number
  ) => Promise<{ success: boolean; loanId?: string; txHash?: string; error?: string }>;
  confirmBorrowing: (loanId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  markReturned: (loanId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  confirmReturn: (loanId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  cancelLoan: (loanId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  fetchSingleLoan: (loanId: string) => Promise<LoanRecord | null>;
  switchToBotChain: () => Promise<void>;
  isWrongNetwork: boolean;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [contractAddress, setContractAddressState] = useState<string>(() => {
    return localStorage.getItem("borrowbook_contract_address") || DEFAULT_CONTRACT_ADDRESS;
  });

  const setContractAddress = (addr: string) => {
    setContractAddressState(addr);
    localStorage.setItem("borrowbook_contract_address", addr);
  };

  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTxPending, setIsTxPending] = useState<boolean>(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isWrongNetwork = isConnected && chainId !== botchainTestnet.id && chainId !== 677;

  const clearStatus = () => {
    setErrorMessage(null);
    setTxMessage(null);
    setLastTxHash(null);
  };

  // Switch to BOT Chain Testnet
  const switchToBotChain = async () => {
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: botchainTestnet.id });
      } else if (typeof window !== "undefined" && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${botchainTestnet.id.toString(16)}` }],
        });
      }
    } catch (switchError: any) {
      if (switchError.code === 4902 && typeof window !== "undefined" && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${botchainTestnet.id.toString(16)}`,
              chainName: botchainTestnet.name,
              nativeCurrency: botchainTestnet.nativeCurrency,
              rpcUrls: botchainTestnet.rpcUrls.default.http,
              blockExplorerUrls: [botchainTestnet.blockExplorers.default.url],
            },
          ],
        });
      }
    }
  };

  // Get read-only provider connected to BOT Chain Testnet RPC
  const getReadProvider = useCallback(() => {
    return new ethers.JsonRpcProvider("https://rpc.bohr.life");
  }, []);

  // Get signer contract instance for writes
  const getSignerContract = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No Web3 wallet detected. Please install MetaMask or use BOT Chain wallet.");
    }
    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await browserProvider.getSigner();
    return new ethers.Contract(contractAddress, BorrowBookABI, signer);
  };

  // Fetch all loans from contract
  const refreshLoans = useCallback(async () => {
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      return;
    }

    try {
      setIsLoading(true);
      const provider = getReadProvider();
      const contract = new ethers.Contract(contractAddress, BorrowBookABI, provider);

      const loanIds: string[] = await contract.getAllLoanIds();
      if (!loanIds || loanIds.length === 0) {
        setLoans([]);
        setIsLoading(false);
        return;
      }

      const loanPromises = loanIds.map(async (id) => {
        try {
          const data = await contract.getLoan(id);
          return {
            loanId: id as `0x${string}`,
            lender: (data[0] || data.lender) as `0x${string}`,
            borrower: (data[1] || data.borrower) as `0x${string}`,
            createdAt: Number(data[2] || data.createdAt),
            expectedReturnDate: Number(data[3] || data.expectedReturnDate),
            returnedAt: Number(data[4] || data.returnedAt),
            status: Number(data[5] || data.status) as LoanStatus,
            itemName: (data[6] || data.itemName) as string,
            description: (data[7] || data.description) as string,
          } as LoanRecord;
        } catch {
          return null;
        }
      });

      const loadedLoans = (await Promise.all(loanPromises)).filter(
        (l): l is LoanRecord => l !== null
      );

      // Sort recent first
      loadedLoans.sort((a, b) => b.createdAt - a.createdAt);
      setLoans(loadedLoans);
    } catch (err: any) {
      console.warn("Could not load loans from contract address:", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, getReadProvider]);

  // Load loans on mount or address change
  useEffect(() => {
    refreshLoans();
  }, [refreshLoans]);

  // Single loan query
  const fetchSingleLoan = async (loanId: string): Promise<LoanRecord | null> => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(contractAddress, BorrowBookABI, provider);
      const formattedId = loanId.startsWith("0x")
        ? (loanId as `0x${string}`)
        : (ethers.keccak256(ethers.toUtf8Bytes(loanId)) as `0x${string}`);

      const data = await contract.getLoan(formattedId);
      return {
        loanId: formattedId,
        lender: (data[0] || data.lender) as `0x${string}`,
        borrower: (data[1] || data.borrower) as `0x${string}`,
        createdAt: Number(data[2] || data.createdAt),
        expectedReturnDate: Number(data[3] || data.expectedReturnDate),
        returnedAt: Number(data[4] || data.returnedAt),
        status: Number(data[5] || data.status) as LoanStatus,
        itemName: (data[6] || data.itemName) as string,
        description: (data[7] || data.description) as string,
      };
    } catch {
      return null;
    }
  };

  // Parse revert errors into human readable text
  const parseContractError = (err: any): string => {
    if (err?.code === "ACTION_REJECTED" || err?.message?.includes("rejected")) {
      return "Transaction was cancelled in your wallet.";
    }
    if (err?.error?.message) return err.error.message;
    if (err?.reason) return err.reason;
    if (err?.data?.message) return err.data.message;
    if (err?.message?.includes("InvalidBorrowerAddress")) return "Invalid borrower address.";
    if (err?.message?.includes("SelfLendingNotAllowed")) return "You cannot lend items to yourself.";
    if (err?.message?.includes("InvalidExpectedReturnDate")) return "Return date must be in the future.";
    if (err?.message?.includes("Unauthorized")) return "You are not authorized to perform this action.";
    if (err?.message?.includes("InvalidStateTransition")) return "This action is invalid for the current loan status.";
    if (err?.message?.includes("DuplicateLoanId")) return "A loan with this ID already exists.";
    return err?.message || "An error occurred while executing transaction.";
  };

  // Create Loan
  const createLoan = async (
    itemName: string,
    description: string,
    borrower: string,
    expectedReturnTimestamp: number
  ) => {
    clearStatus();
    try {
      if (!ethers.isAddress(borrower)) {
        throw new Error("Invalid borrower address format.");
      }
      if (expectedReturnTimestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error("Expected return date must be in the future.");
      }

      setIsTxPending(true);
      setTxMessage("Please confirm transaction in your wallet...");

      const contract = await getSignerContract();
      const uniqueLoanId = generateLoanId(address);

      const tx = await contract.createLoan(
        uniqueLoanId,
        borrower,
        itemName,
        description,
        expectedReturnTimestamp
      );

      setTxMessage(`Transaction submitted: ${tx.hash.slice(0, 10)}... Confirming on BOT Chain...`);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxMessage("Loan successfully created on BOT Chain!");
        await refreshLoans();
        return { success: true, loanId: uniqueLoanId, txHash: tx.hash };
      } else {
        throw new Error("Transaction failed on-chain.");
      }
    } catch (err: any) {
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
      return { success: false, error: parsed };
    } finally {
      setIsTxPending(false);
    }
  };

  // Confirm Borrowing (Borrower confirms receipt)
  const confirmBorrowing = async (loanId: string) => {
    clearStatus();
    try {
      setIsTxPending(true);
      setTxMessage("Awaiting receipt confirmation in your wallet...");

      const contract = await getSignerContract();
      const tx = await contract.confirmBorrowing(loanId);

      setTxMessage(`Confirming receipt on BOT Chain (${tx.hash.slice(0, 10)}...)...`);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxMessage("Item receipt confirmed! Status updated to Borrowed.");
        await refreshLoans();
        return { success: true, txHash: tx.hash };
      } else {
        throw new Error("Transaction execution failed.");
      }
    } catch (err: any) {
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
      return { success: false, error: parsed };
    } finally {
      setIsTxPending(false);
    }
  };

  // Mark Returned (Lender indicates return)
  const markReturned = async (loanId: string) => {
    clearStatus();
    try {
      setIsTxPending(true);
      setTxMessage("Please confirm return initiation in your wallet...");

      const contract = await getSignerContract();
      const tx = await contract.markReturned(loanId);

      setTxMessage(`Initiating return on BOT Chain (${tx.hash.slice(0, 10)}...)...`);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxMessage("Return initiated! Awaiting borrower return confirmation.");
        await refreshLoans();
        return { success: true, txHash: tx.hash };
      } else {
        throw new Error("Transaction execution failed.");
      }
    } catch (err: any) {
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
      return { success: false, error: parsed };
    } finally {
      setIsTxPending(false);
    }
  };

  // Confirm Return (Borrower confirms return completed)
  const confirmReturn = async (loanId: string) => {
    clearStatus();
    try {
      setIsTxPending(true);
      setTxMessage("Please confirm return completion in your wallet...");

      const contract = await getSignerContract();
      const tx = await contract.confirmReturn(loanId);

      setTxMessage(`Finalizing return on BOT Chain (${tx.hash.slice(0, 10)}...)...`);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxMessage("Return verified and recorded permanently on BOT Chain!");
        await refreshLoans();
        return { success: true, txHash: tx.hash };
      } else {
        throw new Error("Transaction execution failed.");
      }
    } catch (err: any) {
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
      return { success: false, error: parsed };
    } finally {
      setIsTxPending(false);
    }
  };

  // Cancel Loan (Lender cancels unconfirmed loan)
  const cancelLoan = async (loanId: string) => {
    clearStatus();
    try {
      setIsTxPending(true);
      setTxMessage("Please confirm cancellation in your wallet...");

      const contract = await getSignerContract();
      const tx = await contract.cancelLoan(loanId);

      setTxMessage(`Cancelling loan on BOT Chain (${tx.hash.slice(0, 10)}...)...`);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait(1);
      if (receipt.status === 1) {
        setTxMessage("Loan has been cancelled.");
        await refreshLoans();
        return { success: true, txHash: tx.hash };
      } else {
        throw new Error("Transaction execution failed.");
      }
    } catch (err: any) {
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
      return { success: false, error: parsed };
    } finally {
      setIsTxPending(false);
    }
  };

  // Filtered lists
  const lowerAddress = address?.toLowerCase();
  const lendingLoans = loans.filter((l) => l.lender.toLowerCase() === lowerAddress);
  const borrowingLoans = loans.filter((l) => l.borrower.toLowerCase() === lowerAddress);

  // Compute stats
  const now = Math.floor(Date.now() / 1000);
  const stats: LoanStats = {
    totalLoans: loans.length,
    activeLoans: loans.filter(
      (l) => l.status === LoanStatus.AwaitingBorrower || l.status === LoanStatus.Borrowed || l.status === LoanStatus.ReturnPending
    ).length,
    returnedLoans: loans.filter((l) => l.status === LoanStatus.Returned).length,
    overdueLoans: loans.filter(
      (l) =>
        (l.status === LoanStatus.AwaitingBorrower || l.status === LoanStatus.Borrowed || l.status === LoanStatus.ReturnPending) &&
        l.expectedReturnDate < now
    ).length,
  };

  return (
    <LoanContext.Provider
      value={{
        contractAddress,
        setContractAddress,
        loans,
        stats,
        lendingLoans,
        borrowingLoans,
        isLoading,
        isTxPending,
        txMessage,
        lastTxHash,
        errorMessage,
        clearStatus,
        refreshLoans,
        createLoan,
        confirmBorrowing,
        markReturned,
        confirmReturn,
        cancelLoan,
        fetchSingleLoan,
        switchToBotChain,
        isWrongNetwork,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoans = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error("useLoans must be used within a LoanProvider");
  }
  return context;
};
