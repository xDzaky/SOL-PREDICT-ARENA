import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SolanaWalletProvider } from "./contexts/WalletProvider";
import { QueryProvider } from "./providers/QueryProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryProvider>
      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </QueryProvider>
  </React.StrictMode>
);
