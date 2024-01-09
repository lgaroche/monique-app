"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { goerli, mainnet } from 'viem/chains'
import { ReactNode } from 'react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

const metadata = {
    name: 'Monique',
    description: 'Monique',
    url: 'https://monique.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, goerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig, projectId, chains })

const Web3Modal = ({ children }: { children: ReactNode }) => (
    <WagmiConfig config={wagmiConfig}>
        {children}
    </WagmiConfig>
)

export default Web3Modal