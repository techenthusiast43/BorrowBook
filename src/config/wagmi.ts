import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { botchainTestnet, botchainMainnet } from "../utils/botchain";

// Project ID from Reown Cloud (WalletConnect)
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

export const networks = [botchainTestnet, botchainMainnet] as const;

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  projectId,
  networks: [botchainTestnet, botchainMainnet],
  transports: {
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
    [botchainMainnet.id]: http("https://rpc.botchain.ai"),
  },
});

export const config = wagmiAdapter.wagmiConfig;

// Initialize Reown AppKit Modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainTestnet, botchainMainnet],
  defaultNetwork: botchainTestnet,
  projectId,
  metadata: {
    name: "BorrowBook",
    description: "Decentralized Lending & Borrowing Tracking on BOT Chain",
    url: "https://borrowbook.botchain.ai",
    icons: ["https://scan.bohr.life/favicon.ico"],
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#0284c7",
    "--w3m-border-radius-master": "8px",
  },
});
