# Creator Connect 🚀

**Cronos x402 Paytech Hackathon Submission**

Creator Connect is an AI-powered influencer marketing platform where brands launch campaigns funded by **USDC stablecoin**, and an **AI Agent** verifies creator submissions (Instagram/YouTube) to automatically release payments via **Smart Contracts** on **Cronos Testnet**.

## 🌟 x402 Paytech Integration

This project demonstrates **x402 protocol compliance** for the Cronos Paytech Hackathon:

### ✅ x402 Features Implemented

1. **USDC Stablecoin Payments**
   - All campaign funding and payouts use USDC (6 decimals)
   - Contract Address: `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0` (Cronos Testnet)

2. **Facilitator SDK Integration**
   - Uses `@crypto.com/facilitator-client` for payment requirements generation
   - Implements payment verification and settlement flow
   - Located in `/api/pay` and `/api/verify` endpoints

3. **Smart Contract Escrow**
   - Deployed at: `0x21C99D4cBE98e673F770EaCF5972C44b41EaC12F`
   - Holds USDC in escrow until AI verification completes
   - Supports dynamic payout percentages based on content quality

4. **AI-Powered Verification**
   - Gemini AI analyzes content quality and brand safety
   - Triggers on-chain USDC payouts automatically
   - Quality-based payout system (50-100% based on score)

---

## 🛠 Prerequisites

- Node.js v20+
- MetaMask (or other wallet) connected to **Cronos Testnet**
- USDC from [Cronos Testnet Faucet](https://cronos.org/faucet)

---

## 🚀 Quick Start

### 1. Get USDC from Faucet

Visit [https://cronos.org/faucet](https://cronos.org/faucet) and:
1. Select **Cronos Testnet (Chain ID 338)**
2. Request **USDC (devUSDC.e)**
3. You'll receive test USDC for campaign funding

### 2. Configure Environment

```bash
cd frontend
cp .env.example .env.local
```

Update `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
PRIVATE_KEY=your_verifier_agent_private_key
```

### 3. Start Frontend & Agent

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Demo Flow

### Brand Creates Campaign

1. **Connect Wallet** (Account with USDC)
2. **Go to "Create Campaign"**
3. **Fill Campaign Details**:
   - Name: "Summer DeFi Launch"
   - Platform: Instagram
   - Budget: 100 USDC
   - Reward per Creator: 10 USDC
4. **Approve USDC** (MetaMask transaction)
5. **Create Campaign** (Escrow locks 100 USDC)

### Creator Enrolls & Submits

1. **Switch Wallet** (Different account)
2. **Browse Campaigns** → Select Campaign #0
3. **Click "Enroll"**
4. **Submit Content URL** (Instagram/YouTube link)
5. **Click "Verify with AI Agent"**

### AI Agent Verifies & Pays

1. **Gemini AI** analyzes content:
   - Platform match (Instagram/YouTube)
   - Content quality score (0-100)
   - Brand safety check
2. **Facilitator SDK** generates payment requirements
3. **Smart Contract** releases USDC to creator
4. **Creator receives** 5-10 USDC (based on quality score)

---

## 📦 Project Structure

```
.
├── contracts/
│   ├── contracts/
│   │   └── CreatorConnectEscrow.sol  # USDC escrow contract
│   └── scripts/
│       └── deploy.ts                  # Deployment script
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── verify/route.ts   # AI verification + payout
│   │   │   │   └── pay/route.ts      # x402 payment settlement
│   │   │   └── dashboard/page.tsx    # Main UI
│   │   ├── components/
│   │   │   ├── CreateCampaignWizard.tsx  # USDC campaign creation
│   │   │   └── CreatorEnrollments.tsx    # Content submission
│   │   └── constants/index.ts        # Contract addresses & ABIs
│   └── package.json                  # Includes @crypto.com/facilitator-client
```

---

## 🔧 Technical Details

### Smart Contract (Solidity)

- **Token**: USDC (ERC20) with 6 decimals
- **Network**: Cronos Testnet (Chain ID 338)
- **Escrow Logic**: Funds locked until AI verification
- **Dynamic Payouts**: 50-100% based on content quality

### Backend API (Next.js)

- **`/api/verify`**: Gemini AI content analysis + on-chain payout
- **`/api/pay`**: x402 Facilitator payment settlement
- **Facilitator SDK**: Generates payment requirements and verifies settlements

### Frontend (React + Wagmi)

- **USDC Integration**: All amounts use 6 decimals (`parseUnits(amount, 6)`)
- **Wallet Connect**: RainbowKit for wallet connections
- **Real-time Updates**: Campaign status and enrollment tracking

---

## 🎯 x402 Compliance Highlights

| Requirement | Implementation |
|-------------|----------------|
| **Stablecoin Payments** | ✅ USDC (6 decimals) |
| **Facilitator SDK** | ✅ `@crypto.com/facilitator-client` |
| **Payment Requirements** | ✅ Generated via Facilitator |
| **Smart Contract Escrow** | ✅ Deployed on Cronos Testnet |
| **AI Agents** | ✅ Gemini-powered verification |
| **Automated Payouts** | ✅ On-chain USDC transfers |

---

## 🏆 Hackathon Submission

**Project Name**: Creator Connect  
**Track**: AI Agentic Finance  
**Deployed Contract**: `0x21C99D4cBE98e673F770EaCF5972C44b41EaC12F`  
**Network**: Cronos Testnet (Chain ID 338)  
**USDC Token**: `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0`

### Key Innovations

1. **AI-Powered Content Verification**: Gemini AI replaces manual review
2. **Quality-Based Payouts**: Dynamic rewards (50-100%) based on content score
3. **Automated Escrow**: Smart contracts eliminate payment disputes
4. **x402 Integration**: Facilitator SDK for payment standardization

---

## 📝 License

MIT License

---

## 🙏 Acknowledgments

Built for the **Cronos x402 Paytech Hackathon**  
Powered by: Cronos, USDC, Gemini AI, Facilitator SDK
