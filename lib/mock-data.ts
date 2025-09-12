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
  return mockCredentials
}

export const getCredentialStats = (credentials: Credential[]) => {
  return {
    total: credentials.length,
    verified: credentials.filter((c) => c.verified).length,
    thisMonth: credentials.filter((c) => {
      const issueDate = new Date(c.issueDate)
      const now = new Date()
      return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear()
    }).length,
  }
}
