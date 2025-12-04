import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const App = () => {
  const endpoint = clusterApiUrl("devnet");

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <main className="min-h-screen bg-midnight text-white flex flex-col items-center justify-center gap-6">
            <div className="space-y-4 text-center">
              <p className="uppercase tracking-[0.5em] text-accent-cyan text-sm">Sol Predict Arena</p>
              <h1 className="text-4xl font-semibold">Connect your wallet to enter the arena</h1>
              <p className="text-slate-300 max-w-lg">
                This starter interface wires up the Solana wallet adapter and Tailwind CSS so you can jump straight into
                building the PvP prediction experience.
              </p>
            </div>
            <WalletMultiButton className="bg-accent-purple hover:bg-purple-600 transition" />
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
