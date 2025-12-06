import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { PublicKey } from "@solana/web3.js";

import { WalletButton } from "./WalletButton";

const useWalletMock = vi.fn();
const useConnectionMock = vi.fn();
const useWalletModalMock = vi.fn();
const useWalletNetworkMock = vi.fn();
const getBalanceMock = vi.fn();

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => useWalletMock(),
  useConnection: () => useConnectionMock()
}));

vi.mock("@solana/wallet-adapter-react-ui", () => ({
  useWalletModal: () => useWalletModalMock()
}));

vi.mock("../../contexts/WalletProvider", () => ({
  useWalletNetwork: () => useWalletNetworkMock()
}));

const baseWalletState = {
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  disconnect: vi.fn(),
  wallet: null,
  connect: vi.fn()
};

const baseNetworkState = {
  network: "devnet",
  setNetwork: vi.fn(),
  isSwitching: false,
  error: null,
  clearError: vi.fn()
};

describe("WalletButton", () => {
  beforeEach(() => {
    useWalletMock.mockReturnValue(baseWalletState);
    useConnectionMock.mockReturnValue({ connection: { getBalance: getBalanceMock } });
    useWalletModalMock.mockReturnValue({ setVisible: vi.fn() });
    useWalletNetworkMock.mockReturnValue(baseNetworkState);
    getBalanceMock.mockReset();
    getBalanceMock.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens the wallet modal when no wallet is selected", () => {
    const setVisible = vi.fn();
    useWalletModalMock.mockReturnValue({ setVisible });

    render(<WalletButton />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    fireEvent.click(button);

    expect(setVisible).toHaveBeenCalledWith(true);
  });

  it("shows the connected wallet summary and toggles dropdown", async () => {
    const mockPublicKey = {
      toBase58: () => "7YkX3QJ9K2PzLmNo1234567890ABCDEF"
    } as unknown as PublicKey;

    const dropdownState = {
      ...baseWalletState,
      publicKey: mockPublicKey,
      connected: true,
      wallet: { adapter: { name: "Phantom" } },
      connect: vi.fn()
    };

    useWalletMock.mockReturnValue(dropdownState);
    getBalanceMock.mockResolvedValue(2_000_000_000); // 2 SOL

    render(<WalletButton />);

    await waitFor(() => {
      expect(getBalanceMock).toHaveBeenCalled();
    });

    expect(await screen.findByText("2 SOL")).toBeInTheDocument();

    const truncatedLabel = "7YkX…CDEF";
    const toggleButton = screen.getByText(truncatedLabel).closest("button");
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);

    expect(await screen.findByText(/copy address/i)).toBeInTheDocument();
  });
});
