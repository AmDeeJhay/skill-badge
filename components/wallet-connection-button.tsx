"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { WalletSelectionModal } from "@/components/wallet-selection-modal"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { Wallet, ChevronDown, Copy, LogOut, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// import { useRouter, usePathname } from "next/navigation" // Removed unused imports

interface WalletConnectionButtonProps {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export function WalletConnectionButton({ variant = "outline", size = "default", }: WalletConnectionButtonProps) {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { isConnected, isConnecting, accounts, selectedAccount, disconnectWallet, selectAccount, formatAddress } =
    usePolkadotWallet()

  const { toast } = useToast()
  // const router = useRouter() // Removed unused
  // const pathname = usePathname() // Removed unused

  const handleConnectWallet = () => {
    setShowWalletModal(true)
  }

   if (isConnected && selectedAccount) {
    return (
      
      <Button
        variant="outline"
        size={size}
        className={`border-blue-300 text-primary hover:bg-blue-50`}
      >
        <Check className="w-4 h-4 mr-2 text-green-500" />
        {formatAddress(selectedAccount.address, 8)}
      </Button>
    )
  }

  const handleCopyAddress = async () => {
    if (selectedAccount) {
      await navigator.clipboard.writeText(selectedAccount.address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  // Show connecting state
  if (isConnecting) {
    return (
      <Button variant={variant} size={size} disabled>
        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Connecting...
      </Button>
    )
  }

  // Show connected state with account dropdown
  if (isConnected && selectedAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">{formatAddress(selectedAccount.address)}</span>
            <Badge variant="secondary" className="hidden md:inline-flex">
              Connected
            </Badge>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              {/* <span className="font-medium">{selectedAccount.meta.name || "Account"}</span> */}
              <span className="text-xs text-muted-foreground font-normal">
                {formatAddress(selectedAccount.address, 12)}
              </span>
            </div>
          </DropdownMenuLabel>

          {accounts.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Account</DropdownMenuLabel>
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.address}
                  onClick={() => selectAccount(account)}
                  className={account.address === selectedAccount.address ? "bg-accent text-accent-foreground" : ""}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{account.meta.name || "Account"}</span>
                    <span className="text-xs text-muted-foreground">{formatAddress(account.address, 12)}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Show connect button
  return (
    <>
      <Button variant={variant} size={size} onClick={handleConnectWallet}>
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <WalletSelectionModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  )
}
