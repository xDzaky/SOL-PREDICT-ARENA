import { BaseWalletAdapter, SendTransactionOptions, WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import type { Connection, Transaction, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";

const icon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzInIGhlaWdodD0nMzInIHZpZXdCb3g9JzAgMCAzMiAzMicgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSIjMDBmOGNmIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDYxOTM0Ii8+PHBhdGggZD0iTTkuNSA4LjVoMTMuNXYxLjVINi40N2wzLjAzLTMuMDN6bTAgNy4wNUgyMy4wNXYxLjVIMTYuM2wtMy4wMyAzLjAzVjE1LjVIOVptMC01SDIzLjA1djEuNUgxNi4zbC0zLjAzIDMuMDNWMTIuNWgtNC4yNHoiIGZpbGw9IiNmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvZz48L3N2Zz4=";

export class TestWalletAdapter extends BaseWalletAdapter {
  name: WalletName<"Test Wallet"> = "Test Wallet" as WalletName<"Test Wallet">;
  url = "https://solpredictarena.dev/test-wallet";
  icon = icon;
  supportedTransactionVersions = null;

  private _publicKey: PublicKey | null = null;
  private _connecting = false;
  private readonly keypair = Keypair.generate();

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return WalletReadyState.Loadable;
  }

  async connect(): Promise<void> {
    if (this._publicKey) {
      return;
    }
    console.info("[TestWalletAdapter] connect invoked");
    this._connecting = true;
    this._publicKey = this.keypair.publicKey;
    this.emit("connect", this._publicKey);
    this._connecting = false;
  }

  async disconnect(): Promise<void> {
    if (!this._publicKey) return;
    this._publicKey = null;
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this._publicKey) {
      throw new Error("Wallet not connected");
    }
    if ("partialSign" in transaction) {
      transaction.partialSign(this.keypair);
    }
    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    return Promise.all(transactions.map((transaction) => this.signTransaction(transaction)));
  }

  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    _connection: Connection,
    _options?: SendTransactionOptions
  ): Promise<TransactionSignature> {
    await this.signTransaction(transaction as Transaction);
    const signature = `TEST_TX_${Date.now()}` as TransactionSignature;
    // Don't emit - not in WalletAdapterEvents type
    return signature;
  }
}
