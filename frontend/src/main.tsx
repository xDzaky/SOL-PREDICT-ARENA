import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SolanaWalletProvider } from "./contexts/WalletProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SolanaWalletProvider>
      <App />
    </SolanaWalletProvider>
  </React.StrictMode>
);
