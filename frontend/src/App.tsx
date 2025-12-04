import WalletButton from "./components/wallet/WalletButton";

const App = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060d] via-[#090f1d] to-[#05060d] px-4 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <p className="uppercase tracking-[0.4em] text-cyan-300 text-xs">Sol Predict Arena</p>
          <h1 className="text-4xl font-bold sm:text-5xl">Connect your wallet to enter the arena</h1>
          <p className="text-slate-300/90 max-w-2xl">
            Manage multi-wallet connections, switch networks, and monitor your balance with a sleek Solana-ready control
            panel. This component serves as the foundation for the rest of the PvP prediction experience.
          </p>
        </div>
        <WalletButton />
      </div>
    </main>
  );
};

export default App;
