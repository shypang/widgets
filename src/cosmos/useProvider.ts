import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { useEffect, useState } from 'react'

import { INFURA_NETWORK_URLS } from './useJsonRpcEndpoint'
import useOption from './useOption'

enum Wallet {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConenct',
}
const [metaMask] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))
const [walletConnect] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: INFURA_NETWORK_URLS as { [chainId: number]: string[] },
      },
    })
)

export default function useProvider(defaultChainId?: number) {
  const connectorType = useOption('provider', { options: [Wallet.MetaMask, Wallet.WalletConnect] })
  const [connector, setConnector] = useState<Connector>()
  useEffect(() => {
    let stale = false
    activateConnector(connectorType)
    return () => {
      stale = true
    }

    async function activateConnector(connectorType: Wallet | undefined) {
      let connector: Connector | undefined
      switch (connectorType) {
        case Wallet.MetaMask:
          await metaMask.activate(defaultChainId)
          connector = metaMask
          break
        case Wallet.WalletConnect:
          await walletConnect.activate(defaultChainId)
          connector = walletConnect
      }
      if (!stale) {
        setConnector((oldConnector) => {
          oldConnector?.deactivate?.()
          return connector
        })
      }
    }
  }, [connectorType])

  return connector?.provider
}
