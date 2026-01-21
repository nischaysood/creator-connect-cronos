// USDC on Cronos Testnet (devUSDC.e - Bridged USDC via Stargate)
export const USDC_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
export const USDC_DECIMALS = 6; // USDC uses 6 decimals, not 18!

// Escrow contract - will be updated after deployment
export const ESCROW_ADDRESS = "0x21C99D4cBE98e673F770EaCF5972C44b41EaC12F";

export const ESCROW_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_usdcToken", "type": "address" },
            { "internalType": "address", "name": "_verifierAgent", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "brand", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "rewardPerCreator", "type": "uint256" }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "CampaignFunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }
        ],
        "name": "CreatorEnrolled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "PaymentReleased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "bool", "name": "success", "type": "bool" }
        ],
        "name": "SubmissionVerified",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "campaignEnrollments",
        "outputs": [
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "string", "name": "submissionUrl", "type": "string" },
            { "internalType": "bool", "name": "isVerified", "type": "bool" },
            { "internalType": "bool", "name": "isPaid", "type": "bool" },
            { "internalType": "uint256", "name": "joinedAt", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "campaigns",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "address", "name": "brand", "type": "address" },
            { "internalType": "string", "name": "details", "type": "string" },
            { "internalType": "uint256", "name": "rewardPerCreator", "type": "uint256" },
            { "internalType": "uint256", "name": "maxCreators", "type": "uint256" },
            { "internalType": "uint256", "name": "totalDeposited", "type": "uint256" },
            { "internalType": "uint256", "name": "totalPaid", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_details", "type": "string" },
            { "internalType": "uint256", "name": "_rewardPerCreator", "type": "uint256" },
            { "internalType": "uint256", "name": "_maxCreators", "type": "uint256" },
            { "internalType": "uint256", "name": "_durationDays", "type": "uint256" }
        ],
        "name": "createCampaign",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }],
        "name": "enroll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "string", "name": "_bio", "type": "string" },
            { "internalType": "string", "name": "_avatar", "type": "string" },
            { "internalType": "string", "name": "_role", "type": "string" }
        ],
        "name": "registerProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "profiles",
        "outputs": [
            { "internalType": "address", "name": "wallet", "type": "address" },
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "bio", "type": "string" },
            { "internalType": "string", "name": "avatar", "type": "string" },
            { "internalType": "string", "name": "role", "type": "string" },
            { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllProfileAddresses",
        "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_campaignId", "type": "uint256" }],
        "name": "getCampaignEnrollments",
        "outputs": [
            {
                "components": [
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "string", "name": "submissionUrl", "type": "string" },
                    { "internalType": "bool", "name": "isVerified", "type": "bool" },
                    { "internalType": "bool", "name": "isPaid", "type": "bool" },
                    { "internalType": "bool", "name": "isRejected", "type": "bool" },
                    { "internalType": "uint256", "name": "joinedAt", "type": "uint256" }
                ],
                "internalType": "struct CreatorConnectEscrow.Enrollment[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "hasEnrolled",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdcToken",
        "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCampaignId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "string", "name": "_url", "type": "string" }
        ],
        "name": "submitContent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_newVerifier", "type": "address" }],
        "name": "updateVerifier",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "verifierAgent",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "address", "name": "_creator", "type": "address" },
            { "internalType": "bool", "name": "_isValid", "type": "bool" }
        ],
        "name": "verifyAndRelease",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "bool", "name": "_isActive", "type": "bool" }
        ],
        "name": "toggleCampaignStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" }
        ],
        "name": "withdrawRemainingFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "bool", "name": "_isActive", "type": "bool" }
        ],
        "name": "toggleCampaignStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" }
        ],
        "name": "withdrawRemainingFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Standard ERC20 ABI for USDC
export const USDC_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "allowance", "type": "uint256" },
            { "internalType": "uint256", "name": "needed", "type": "uint256" }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "sender", "type": "address" },
            { "internalType": "uint256", "name": "balance", "type": "uint256" },
            { "internalType": "uint256", "name": "needed", "type": "uint256" }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [{ "internalType": "address", "name": "approver", "type": "address" }],
        "name": "ERC20InvalidApprover",
        "type": "error"
    },
    {
        "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }],
        "name": "ERC20InvalidReceiver",
        "type": "error"
    },
    {
        "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }],
        "name": "ERC20InvalidSender",
        "type": "error"
    },
    {
        "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }],
        "name": "ERC20InvalidSpender",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "from", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
