"use client";

import React from 'react';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    cronosTestnet,
    hardhat,
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { AutoFaucet } from './AutoFaucet';
import { defineChain } from 'viem';

import '@rainbow-me/rainbowkit/styles.css';

// Custom Cronos Testnet with fallback RPCs for reliability
const cronosTestnetWithFallbacks = defineChain({
    id: 338,
    name: 'Cronos Testnet',
    nativeCurrency: { name: 'tCRO', symbol: 'tCRO', decimals: 18 },
    rpcUrls: {
        default: {
            http: [
                'https://evm-t3.cronos.org/',
                'https://cronos-testnet.drpc.org',
                'https://rpc-t3.cronos.org/',
            ],
        },
    },
    blockExplorers: {
        default: { name: 'Cronos Explorer', url: 'https://explorer.cronos.org/testnet' },
    },
    testnet: true,
});

const config = getDefaultConfig({
    appName: 'Creator Connect',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect Project ID
    chains: [cronosTestnetWithFallbacks, hardhat],
    ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#3b82f6',
                    accentColorForeground: 'white',
                    borderRadius: 'large',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}>
                    <AutoFaucet />
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
