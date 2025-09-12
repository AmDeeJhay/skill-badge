"use client"

import { Badge } from "@/components/ui/badge"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function WalletStatusIndicator() {
  const { isConnected, isConnecting, error, availableWallets } = usePolkadotWallet()

  // Check if any wallet extensions are available
  const hasAvailableWallets = availableWallets.length > 0

  if (!hasAvailableWallets) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Extension Required
      </Badge>
    )
  }

  if (error) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Connection Error
      </Badge>
    )
  }

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Connecting...
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
        <CheckCircle className="w-3 h-3" />
        Connected
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <AlertCircle className="w-3 h-3" />
      Not Connected
    </Badge>
  )
}
