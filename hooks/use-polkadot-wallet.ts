

import { useState, useEffect, useCallback } from "react"
import type { InjectedAccountWithMeta, InjectedExtension, WalletState } from "@/lib/types"

declare global {
  interface Window {
    injectedWeb3?: {
      [key: string]: {
        enable: (appName: string) => Promise<InjectedExtension>
        version: string
      }
    }
  }
}

export const SUPPORTED_WALLETS = [
  {
    name: "Polkadot{.js}",
    key: "polkadot-js",
    icon: "🟣",
    installUrl: "https://polkadot.js.org/extension/",
  },
  {
    name: "Talisman",
    key: "talisman",
    icon: "🔮",
    installUrl: "https://talisman.xyz/",
  },
  {
    name: "SubWallet",
    key: "subwallet-js",
    icon: "🌟",
    installUrl: "https://subwallet.app/",
  },
]

export function usePolkadotWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    accounts: [],
    selectedAccount: null,
    extension: null,
    error: null,
  })

  const getAvailableWallets = useCallback(() => {
    if (typeof window === "undefined") return []

    return SUPPORTED_WALLETS.filter((wallet) => {
      return window.injectedWeb3 && window.injectedWeb3[wallet.key]
    })
  }, [])

  // Add this function to check if any extension is available
  const isExtensionAvailable = useCallback(() => {
    if (typeof window === "undefined") return false
    return getAvailableWallets().length > 0
  }, [getAvailableWallets])

  const connectWallet = useCallback(
    async (walletKey?: string) => {
      const availableWallets = getAvailableWallets()

      if (availableWallets.length === 0) {
        setWalletState((prev) => ({
          ...prev,
          error: "No supported wallet extensions found. Please install a Polkadot wallet extension.",
        }))
        return
      }

      // Use specified wallet or default to first available
      const selectedWallet = walletKey
        ? availableWallets.find((w) => w.key === walletKey) || availableWallets[0]
        : availableWallets[0]

      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

      try {
        const extension = await window.injectedWeb3![selectedWallet.key].enable("Skill Passport")
        const accounts = await extension.accounts.get()

        if (accounts.length === 0) {
          throw new Error("No accounts found. Please create an account in your wallet extension.")
        }

        setWalletState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          extension,
          accounts,
          selectedAccount: accounts[0],
          error: null,
        }))

        localStorage.setItem("polkadot-wallet-connected", "true")
        localStorage.setItem("polkadot-selected-account", accounts[0].address)
        localStorage.setItem("polkadot-selected-wallet", selectedWallet.key)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error instanceof Error ? error.message : "Failed to connect wallet",
        }))
      }
    },
    [getAvailableWallets],
  )

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      accounts: [],
      selectedAccount: null,
      extension: null,
      error: null,
    })
    localStorage.removeItem("polkadot-wallet-connected")
    localStorage.removeItem("polkadot-selected-account")
    localStorage.removeItem("polkadot-selected-wallet")
  }, [])

  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setWalletState((prev) => ({ ...prev, selectedAccount: account }))
    localStorage.setItem("polkadot-selected-account", account.address)
  }, [])

  const formatAddress = useCallback((address: string, length = 8) => {
    if (!address) return ""
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }, [])

  useEffect(() => {
    const restoreConnection = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const wasConnected = localStorage.getItem("polkadot-wallet-connected")
      const savedAccount = localStorage.getItem("polkadot-selected-account")
      const savedWallet = localStorage.getItem("polkadot-selected-wallet")

      if (wasConnected && savedWallet) {
        const availableWallets = getAvailableWallets()
        const wallet = availableWallets.find((w) => w.key === savedWallet)

        if (wallet) {
          try {
            const extension = await window.injectedWeb3![wallet.key].enable("Skill Passport")
            const accounts = await extension.accounts.get()

            if (accounts.length > 0) {
              const selectedAccount = savedAccount
                ? accounts.find((acc) => acc.address === savedAccount) || accounts[0]
                : accounts[0]

              setWalletState({
                isConnected: true,
                isConnecting: false,
                extension,
                accounts,
                selectedAccount,
                error: null,
              })
            }
          } catch (error) {
            console.error("Failed to restore wallet connection:", error)
            localStorage.removeItem("polkadot-wallet-connected")
            localStorage.removeItem("polkadot-selected-account")
            localStorage.removeItem("polkadot-selected-wallet")
          }
        }
      }
    }

    restoreConnection()
  }, [getAvailableWallets])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    selectAccount,
    formatAddress,
    availableWallets: getAvailableWallets(),
    supportedWallets: SUPPORTED_WALLETS,
    isExtensionAvailable: isExtensionAvailable(), // Add this line
  }
}
