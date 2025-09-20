export interface Credential {
  id: string
  skillName: string
  issuerName: string
  issueDate: string
  description?: string
  badgeColor: string
  verified: boolean
  transactionHash?: string
}

// Mock credentials data for demonstration
export const mockCredentials: Credential[] = [
  {
    id: "1",
    skillName: "React Development",
    issuerName: "Tech Academy",
    issueDate: "2024-01-15",
    description: "Advanced React.js development including hooks, context, and performance optimization",
    badgeColor: "bg-blue-500",
    verified: true,
    transactionHash: "0x1234...abcd",
  },
  {
    id: "2",
    skillName: "Blockchain Development",
    issuerName: "Polkadot Institute",
    issueDate: "2024-02-20",
    description: "Substrate and Polkadot ecosystem development fundamentals",
    badgeColor: "bg-purple-500",
    verified: true,
    transactionHash: "0x5678...efgh",
  },
  {
    id: "3",
    skillName: "TypeScript Expert",
    issuerName: "Code Masters",
    issueDate: "2024-03-10",
    description: "Advanced TypeScript patterns, generics, and type system mastery",
    badgeColor: "bg-green-500",
    verified: true,
    transactionHash: "0x9abc...ijkl",
  },
  {
    id: "4",
    skillName: "UI/UX Design",
    issuerName: "Design Studio",
    issueDate: "2024-03-25",
    description: "User interface and experience design principles and best practices",
    badgeColor: "bg-pink-500",
    verified: true,
    transactionHash: "0xdef0...mnop",
  },
]

export const getCredentialsByAddress = (address: string): Credential[] => {
  // In a real app, this would fetch from blockchain/database
  // For now, returning all credentials since we don't have address-specific filtering
  console.log('Fetching credentials for address:', address)
  return getAllCredentials()
}

// Simulated storage for newly minted credentials
const mintedCredentials: Credential[] = []

// Function to add a new credential (called from mint page)
export const addMintedCredential = (credential: Omit<Credential, 'id'>) => {
  const newCredential: Credential = {
    ...credential,
    id: `MINT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }
  mintedCredentials.unshift(newCredential) // Add to beginning for recent order
  return newCredential
}

// Get all credentials including minted ones
export const getAllCredentials = (/* _address: string */): Credential[] => {
  return [...mintedCredentials, ...mockCredentials]
}

// Get recent credentials (last 3-4)
export const getRecentCredentials = (/* _address: string, */ limit: number = 4): Credential[] => {
  const allCredentials = getAllCredentials()
  return allCredentials
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, limit)
}

export const getCredentialStats = (credentials: Credential[]) => {
  const now = new Date()
  const thisMonth = credentials.filter((c) => {
    const issueDate = new Date(c.issueDate)
    return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear()
  }).length

  return {
    total: credentials.length,
    verified: credentials.filter((c) => c.verified).length,
    thisMonth,
    skillAreas: new Set(credentials.map(c => c.skillName.split(' ')[0])).size, // Count unique skill areas
  }
}
