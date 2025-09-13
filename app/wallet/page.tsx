"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WalletPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to profile page (which now serves as credentials page)
    router.replace("/credential")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to credentials...</p>
      </div>
    </div>
  )
}
