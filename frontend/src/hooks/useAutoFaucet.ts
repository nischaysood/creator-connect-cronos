"use client";

import { useEffect, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';

export function useAutoFaucet() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const hasFunded = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Only run on localhost/hardhat (chainId 31337)
        if (!isConnected || !address || chainId !== 31337) {
            return;
        }

        // Don't fund the same address twice in one session
        if (hasFunded.current.has(address)) {
            return;
        }

        const fundWallet = async () => {
            try {
                console.log('[AutoFaucet] Funding wallet:', address);
                const res = await fetch('/api/faucet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                });
                const data = await res.json();

                if (data.success) {
                    hasFunded.current.add(address);
                    if (data.funded) {
                        console.log('[AutoFaucet] Wallet funded!', data.balances);
                    } else {
                        console.log('[AutoFaucet] Wallet already has funds');
                    }
                }
            } catch (e) {
                console.error('[AutoFaucet] Error:', e);
            }
        };

        fundWallet();
    }, [address, isConnected, chainId]);
}
