import { NextResponse } from 'next/server';
import { createWalletClient, http, publicActions, parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { USDC_ADDRESS, USDC_ABI, USDC_DECIMALS } from '@/constants';

// Hardhat Account #0 - has unlimited ETH
const FUNDER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`;
const funderAccount = privateKeyToAccount(FUNDER_PRIVATE_KEY);

const client = createWalletClient({
    account: funderAccount,
    chain: hardhat,
    transport: http('http://127.0.0.1:8545')
}).extend(publicActions);

export async function POST(req: Request) {
    try {
        const { address } = await req.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        console.log(`[Faucet] Funding request for: ${address}`);

        // Check current balances
        const ethBalance = await client.getBalance({ address: address as `0x${string}` });
        const usdcBalance = await client.readContract({
            address: USDC_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        let funded = false;

        // Fund ETH if low
        if (ethBalance < parseEther('1')) {
            console.log(`[Faucet] Sending 100 ETH to ${address}...`);
            await client.sendTransaction({
                to: address as `0x${string}`,
                value: parseEther('100')
            });
            funded = true;
        }

        // Mint USDC if low (Localhost only)
        if (usdcBalance < parseUnits('100', USDC_DECIMALS)) {
            console.log(`[Faucet] Minting 10,000 USDC to ${address}...`);
            await client.writeContract({
                address: USDC_ADDRESS as `0x${string}`,
                abi: USDC_ABI,
                functionName: 'mint',
                args: [address as `0x${string}`, parseUnits('10000', USDC_DECIMALS)]
            });
            funded = true;
        }

        // Get updated balances
        const newEthBalance = await client.getBalance({ address: address as `0x${string}` });
        const newMneeBalance = await client.readContract({
            address: USDC_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        return NextResponse.json({
            success: true,
            funded,
            balances: {
                eth: formatEther(newEthBalance),
                usdc: formatUnits(newMneeBalance, USDC_DECIMALS)
            }
        });

    } catch (error: any) {
        console.error('[Faucet] Error:', error.message);
        // If we can't connect to localhost, just return success (probably on mainnet)
        if (error.message?.includes('ECONNREFUSED')) {
            return NextResponse.json({ success: true, funded: false, message: 'Not on localhost' });
        }
        return NextResponse.json({ error: 'Faucet error' }, { status: 500 });
    }
}
