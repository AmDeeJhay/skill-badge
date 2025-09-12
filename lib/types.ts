export interface InjectedAccountWithMeta {
  address: string
  meta: {
    genesisHash?: string | null
    name?: string
    source: string
  }
  type?: string
}

export interface InjectedExtension {
  name: string
  version: string
  accounts: {
    get: () => Promise<InjectedAccountWithMeta[]>
  }
  signer: any
}

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  extension: InjectedExtension | null
  error: string | null
}
