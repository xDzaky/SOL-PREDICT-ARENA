import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Copy, ExternalLink, Loader2, LogOut, Wallet } from "lucide-react";
import clsx from "clsx";

import { NetworkCluster, useWalletNetwork } from "../../contexts/WalletProvider";

const NETWORK_LABELS: Record<NetworkCluster, string> = {
  devnet: "Devnet",
  "mainnet-beta": "Mainnet",
};

const truncateAddress = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

const getExplorerUrl = (address: PublicKey, network: NetworkCluster) => {
  const base = `https://explorer.solana.com/address/${address.toString()}`;
  return network === "mainnet-beta" ? base : `${base}?cluster=${network}`;
};

export const WalletButton = () => {
  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect,
    wallet,
    connect,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const { network, setNetwork, isSwitching, error, clearError } = useWalletNetwork();

  const [balance, setBalance] = useState<string>("0");
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = useMemo(() => {
    if (isSwitching) return "Switching";
    if (connecting) return "Connecting";
    if (disconnecting) return "Disconnecting";
    return connected ? "Connected" : "Disconnected";
  }, [connected, connecting, disconnecting, isSwitching]);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance("0");
      return;
    }

    let isSubscribed = true;
    setFetchingBalance(true);

    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!isSubscribed) return;
        const sol = lamports / LAMPORTS_PER_SOL;
        setBalance(sol.toLocaleString(undefined, { maximumFractionDigits: 4 }));
      })
      .catch((fetchError) => {
        console.error("Failed to fetch balance", fetchError);
        if (isSubscribed) setActionError("Unable to fetch balance. Try again shortly.");
      })
      .finally(() => {
        if (isSubscribed) setFetchingBalance(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [publicKey, connection, connected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async () => {
    setActionError(null);
    setDropdownOpen(false);

    if (!wallet) {
      setVisible(true);
      return;
    }

    try {
      await connect();
    } catch (connectError) {
      console.error("Wallet connect error", connectError);
      setActionError((connectError as Error).message ?? "Failed to connect wallet");
    }
  };

  const handleDisconnect = async () => {
    setDropdownOpen(false);
    try {
      await disconnect();
    } catch (disconnectError) {
      console.error("Wallet disconnect error", disconnectError);
      setActionError("Unable to disconnect wallet. Please retry.");
    }
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (copyError) {
      console.error("Clipboard error", copyError);
      setActionError("Failed to copy address");
    }
  };

  const handleViewExplorer = () => {
    if (!publicKey) return;
    window.open(getExplorerUrl(publicKey, network), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#131a2c] to-[#0b1120] p-6 shadow-[0_20px_60px_rgba(59,130,246,0.25)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Wallet Access</p>
          <p className="text-sm text-slate-400">Connect securely to start predicting</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
          Network
          <select
            value={network}
            onChange={(event) => setNetwork(event.target.value as NetworkCluster)}
            className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {Object.entries(NETWORK_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-slate-900 text-white">
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={connected ? () => setDropdownOpen((prev) => !prev) : handleConnect}
          className={clsx(
            "group relative flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition",
            "border-white/10 bg-white/5 hover:border-cyan-300/60 hover:bg-white/10",
            connected ? "text-white" : "text-slate-100",
            (connecting || disconnecting || isSwitching) && "cursor-progress"
          )}
          disabled={connecting || disconnecting || isSwitching}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-lg">
              {connecting || disconnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {connected && publicKey ? truncateAddress(publicKey.toBase58()) : "Connect Wallet"}
              </p>
              <p className="text-xs text-slate-400">{statusLabel}</p>
            </div>
          </div>
          {connected && (
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <span>{fetchingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : `${balance} SOL`}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={clsx("h-4 w-4 transition", dropdownOpen ? "rotate-180" : "rotate-0")}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}
        </button>

        {dropdownOpen && connected && (
          <div
            ref={dropdownRef}
            className="mt-3 rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/5"
              >
                <Copy className="h-4 w-4 text-cyan-300" />
                {copied ? "Copied!" : "Copy address"}
              </button>
              <button
                type="button"
                onClick={handleViewExplorer}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4 text-cyan-300" />
                View on Explorer
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-300 transition hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 text-xs text-slate-400">
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
          <div>
            <p className="text-slate-300">Preferred Wallet</p>
            <p className="text-slate-500">{wallet?.adapter?.name ?? "Not selected"}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(true);
              setDropdownOpen(false);
            }}
            className="text-cyan-300 transition hover:text-cyan-200"
          >
            Change
          </button>
        </div>
        {(error || actionError) && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100">
            <div className="flex items-center justify-between">
              <p className="font-medium">{actionError ?? error}</p>
              <button
                type="button"
                aria-label="Dismiss error"
                className="text-xs uppercase tracking-widest text-rose-200"
                onClick={() => {
                  setActionError(null);
                  clearError();
                }}
              >
                Clear
              </button>
            </div>
            <p className="mt-1 text-[11px] text-rose-200/80">
              If the issue persists, try switching networks or reconnecting your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletButton;
