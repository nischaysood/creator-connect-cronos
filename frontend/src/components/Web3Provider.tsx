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

import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
    appName: 'Creator Connect',
    projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect Project ID
    chains: [cronosTestnet, hardhat],
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
