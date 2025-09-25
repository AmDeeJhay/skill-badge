

import { useState, useEffect, useCallback } from "react"
import type { InjectedAccountWithMeta, InjectedExtension, WalletState } from "@/lib/types"
import { getCredentialsByAddress } from "@/lib/data-service"
import { getCredentialStats } from "@/lib/mock-data"

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
  
  const [credentials, setCredentials] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false)

  // Load credentials function - defined early to avoid circular dependencies
  const loadCredentials = useCallback(async (address: string) => {
    if (!address) return
    
    console.log('Loading credentials for address:', address)
    setIsLoadingCredentials(true)
    try {
      const userCredentials = await getCredentialsByAddress(address)
      console.log('Loaded credentials:', userCredentials)
      setCredentials(userCredentials || [])
      setStats(getCredentialStats(userCredentials || []))
    } catch (error) {
      console.error('Failed to load credentials:', error)
      // Fallback to empty arrays if API fails
      setCredentials([])
      setStats({ total: 0, verified: 0, thisMonth: 0, skillAreas: 0 })
    } finally {
      setIsLoadingCredentials(false)
    }
  }, [])

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
        
        // Load credentials for the connected account
        loadCredentials(accounts[0].address)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error instanceof Error ? error.message : "Failed to connect wallet",
        }))
      }
    },
    [getAvailableWallets, loadCredentials],
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

  const formatAddress = useCallback((address: string, length = 8) => {
    if (!address) return ""
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }, [])

  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setWalletState((prev) => ({ ...prev, selectedAccount: account }))
    localStorage.setItem("polkadot-selected-account", account.address)
    loadCredentials(account.address)
  }, [loadCredentials])

  useEffect(() => {
    const restoreConnection = async () => {
      // Wait for the component to mount and router to be available
      await new Promise((resolve) => setTimeout(resolve, 100))

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

              // Load credentials for the restored account
              loadCredentials(selectedAccount.address)
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
  }, [getAvailableWallets, loadCredentials])

  // Load credentials when selected account changes
  useEffect(() => {
    if (walletState.selectedAccount?.address) {
      loadCredentials(walletState.selectedAccount.address)
    }
  }, [walletState.selectedAccount?.address, loadCredentials])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    selectAccount,
    formatAddress,
    availableWallets: getAvailableWallets(),
    supportedWallets: SUPPORTED_WALLETS,
    isExtensionAvailable: isExtensionAvailable(),
    credentials,
    stats,
    isLoadingCredentials,
    loadCredentials,
  }
}
