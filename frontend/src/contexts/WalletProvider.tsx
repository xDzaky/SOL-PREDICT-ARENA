import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider as AdapterWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";

import "@solana/wallet-adapter-react-ui/styles.css";

const NETWORK_STORAGE_KEY = "sol-predict-arena-network";

export type NetworkCluster = "devnet" | "mainnet-beta";

interface WalletNetworkContextValue {
  network: NetworkCluster;
  endpoint: string;
  setNetwork: (network: NetworkCluster) => void;
  isSwitching: boolean;
  error: string | null;
  clearError: () => void;
}

const WalletNetworkContext = createContext<WalletNetworkContextValue | undefined>(undefined);

const getInitialNetwork = (): NetworkCluster => {
  if (typeof window === "undefined") return "devnet";
  const stored = window.localStorage.getItem(NETWORK_STORAGE_KEY) as NetworkCluster | null;
  return stored ?? "devnet";
};

export const useWalletNetwork = (): WalletNetworkContextValue => {
  const context = useContext(WalletNetworkContext);
  if (!context) {
    throw new Error("useWalletNetwork must be used within SolanaWalletProvider");
  }
  return context;
};

export const SolanaWalletProvider = ({ children }: PropsWithChildren) => {
  const [network, setNetworkState] = useState<NetworkCluster>(getInitialNetwork);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const targetNetwork = network === "mainnet-beta" ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;
    return clusterApiUrl(targetNetwork);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  const handleWalletError = useCallback((walletError: WalletError) => {
    console.error("Wallet error:", walletError);
    setError(walletError?.message ?? "Something went wrong with your wallet connection.");
  }, []);

  useEffect(() => {
    wallets.forEach((wallet) => wallet.on("error", handleWalletError));
    return () => wallets.forEach((wallet) => wallet.off("error", handleWalletError));
  }, [wallets, handleWalletError]);

  const handleSetNetwork = useCallback(
    (nextNetwork: NetworkCluster) => {
      if (network === nextNetwork) return;
      setIsSwitching(true);
      setNetworkState(nextNetwork);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(NETWORK_STORAGE_KEY, nextNetwork);
      }
      // Give wallet adapters time to re-initialize
      setTimeout(() => setIsSwitching(false), 150);
    },
    [network]
  );

  const clearError = useCallback(() => setError(null), []);

  const contextValue = useMemo(
  () => ({ network, endpoint, setNetwork: handleSetNetwork, isSwitching, error, clearError }),
    [network, endpoint, handleSetNetwork, isSwitching, error, clearError]
  );

  return (
    <WalletNetworkContext.Provider value={contextValue}>
      <ConnectionProvider endpoint={endpoint} config={{ commitment: "processed" }}>
        <AdapterWalletProvider wallets={wallets} autoConnect onError={handleWalletError}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </AdapterWalletProvider>
      </ConnectionProvider>
    </WalletNetworkContext.Provider>
  );
};
