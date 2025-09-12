"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wallet } from "lucide-react"
import { usePolkadotWallet, SUPPORTED_WALLETS } from "@/hooks/use-polkadot-wallet"

interface WalletSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletSelectionModal({ open, onOpenChange }: WalletSelectionModalProps) {
  const { connectWallet, availableWallets } = usePolkadotWallet()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleWalletSelect = async (walletKey: string) => {
    try {
      setSelectedWallet(walletKey)
      setIsConnecting(true)
      
      await connectWallet(walletKey)
      
      // Keep modal open for a moment to allow wallet interactions
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onOpenChange(false)
      setSelectedWallet(null)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose a wallet to connect to Skill Passport.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isAvailable = availableWallets.some((w) => w.key === wallet.key)

            return (
              <div
                key={wallet.key}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  isAvailable ? "border-border hover:border-primary/50 cursor-pointer" : "border-muted bg-muted/30"
                }`}
                onClick={isAvailable ? () => handleWalletSelect(wallet.key) : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {isAvailable ? "Ready to connect" : "Not detected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAvailable ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWalletSelect(wallet.key)
                      }}
                      disabled={isConnecting && selectedWallet === wallet.key}
                    >
                      {isConnecting && selectedWallet === wallet.key ? "Connecting..." : "Connect"}
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Not Available
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {availableWallets.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="mb-4">No wallet extensions detected.</p>
            <p className="text-sm">Please install a supported wallet extension and refresh the page.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
