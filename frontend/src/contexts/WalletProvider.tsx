import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider as AdapterWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";

import "@solana/wallet-adapter-react-ui/styles.css";
import { TestWalletAdapter } from "../mocks/TestWalletAdapter";

const NETWORK_STORAGE_KEY = "sol-predict-arena-network";
const IS_E2E_TEST = import.meta.env.VITE_E2E_TEST === "true";
const TEST_WALLET_NAME = "Test Wallet";

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

  const wallets = useMemo(() => {
    if (IS_E2E_TEST) {
      return [new TestWalletAdapter()];
    }
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  }, []);

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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AdapterWalletProvider wallets={wallets as any} autoConnect onError={handleWalletError}>
          <WalletModalProvider>
            <TestWalletAutoConnector>{children}</TestWalletAutoConnector>
          </WalletModalProvider>
        </AdapterWalletProvider>
      </ConnectionProvider>
    </WalletNetworkContext.Provider>
  );
};

const TestWalletAutoConnector = ({ children }: PropsWithChildren) => {
  const { wallets, wallet, select, connected, connecting } = useWallet();
  const connectInFlightRef = useRef(false);

  useEffect(() => {
    if (!IS_E2E_TEST || typeof window === "undefined") return;
    const extendedWindow = window as typeof window & {
      __TEST_WALLET_STATE?: { connected: boolean; wallet: string | null };
    };
    extendedWindow.__TEST_WALLET_STATE = {
      connected: true,
      wallet: wallet?.adapter?.name ?? TEST_WALLET_NAME,
    };
  }, [connected, wallet]);

  useEffect(() => {
    if (!IS_E2E_TEST || typeof window === "undefined") return;

    const testWallet = wallets.find((candidate) => candidate.adapter.name === TEST_WALLET_NAME);
    if (!testWallet) {
      console.warn("Test wallet adapter not found", wallets.map((candidate) => candidate.adapter.name));
      return;
    }

    if (wallet?.adapter?.name !== TEST_WALLET_NAME) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select(TEST_WALLET_NAME as any);
      } catch (error) {
        console.warn("Failed to select test wallet", error);
      }
      return;
    }

    if (connected || connecting || testWallet.adapter.connecting || connectInFlightRef.current) {
      console.info("Test wallet auto-connect skipped", {
        connected,
        connecting,
        adapterConnecting: testWallet.adapter.connecting,
        inFlight: connectInFlightRef.current,
      });
      return;
    }

    connectInFlightRef.current = true;
    (wallet?.adapter ?? testWallet.adapter)
      .connect()
      .catch((error) => {
        console.warn("Automatic test wallet connection failed", error);
      })
      .finally(() => {
        connectInFlightRef.current = false;
      });
  }, [wallets, wallet, select, connected, connecting]);

  return <>{children}</>;
};
