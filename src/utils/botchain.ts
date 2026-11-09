import { defineChain } from "viem";

export const botchainTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "BohrScan",
      url: "https://scan.bohr.life",
    },
  },
  testnet: true,
});

export const botchainMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOTScan",
      url: "https://scan.botchain.ai",
    },
  },
  testnet: false,
});

import deployedInfo from "../contracts/deployedAddress.json";

// Default contract address (can be overridden via environment or deployedAddress.json)
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` = (
  import.meta.env.VITE_BORROWBOOK_CONTRACT_ADDRESS ||
  deployedInfo?.address ||
  "0xc493b04825aA69491f13d463A3d974766489D4b3"
) as `0x${string}`;

export function getExplorerTxUrl(txHash: string, chainId: number = 968): string {
  const baseUrl = chainId === 677 ? "https://scan.botchain.ai" : "https://scan.bohr.life";
  return `${baseUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string, chainId: number = 968): string {
  const baseUrl = chainId === 677 ? "https://scan.botchain.ai" : "https://scan.bohr.life";
  return `${baseUrl}/address/${address}`;
}

