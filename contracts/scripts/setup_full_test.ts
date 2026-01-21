import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer, creator, brand] = await ethers.getSigners();

    console.log("\n=================================================");
    console.log("🚀 STARTING FULL TEST SETUP");
    console.log("=================================================\n");

    console.log("👤 Accounts:");
    console.log("   Account #0 (Deployer/Brand):", deployer.address);
    // Note: In local hardhat node, these are deterministic
    // Account #0 PK: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    console.log("   Account #1 (Creator):       ", creator.address);
    // Account #1 PK: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

    console.log("\n-------------------------------------------------");
    console.log("📦 Deploying Contracts...");

    // 1. Deploy Mock MNEE
    const MockMNEE = await ethers.getContractFactory("MockMNEE");
    const mnee = await MockMNEE.deploy();
    await mnee.waitForDeployment();
    const mneeAddress = await mnee.getAddress();
    console.log("   ✅ MockMNEE Deployed at:    ", mneeAddress);

    // 2. Deploy Escrow
    const agentAddress = deployer.address;
    const Escrow = await ethers.getContractFactory("CreatorConnectEscrow");
    const escrow = await Escrow.deploy(mneeAddress, agentAddress);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();

    // LOG IMMEDIATELY
    console.log("-------------------------------------------------");
    console.log("!!! DEPLOYMENT DETAILS (SAVE THESE) !!!");
    console.log(`MOCK_MNEE: ${mneeAddress}`);
    console.log(`ESCROW:    ${escrowAddress}`);
    console.log("-------------------------------------------------");

    console.log("\n-------------------------------------------------");
    console.log("💰 Minting Test Tokens...");

    const MINT_AMOUNT = ethers.parseEther("10000"); // 10,000 MNEE

    // Mint to Brand (Deployer)
    await mnee.mint(deployer.address, MINT_AMOUNT);
    console.log(`   ✅ Minted ${ethers.formatEther(MINT_AMOUNT)} MNEE to Brand (${deployer.address})`);

    // Mint to Creator
    await mnee.mint(creator.address, MINT_AMOUNT);
    console.log(`   ✅ Minted ${ethers.formatEther(MINT_AMOUNT)} MNEE to Creator (${creator.address})`);

    console.log("\n-------------------------------------------------");
    console.log("⚙️  Frontend Configuration");
    console.log("   Copy these values to frontend/src/constants/index.ts:");
    console.log("");
    console.log(`   export const MOCK_MNEE_ADDRESS = "${mneeAddress}";`);
    console.log(`   export const ESCROW_ADDRESS = "${escrowAddress}";`);
    console.log("\n=================================================");
    console.log("✅ SETUP COMPLETE");
    console.log("=================================================\n");

    // Explicit exit to prevent 'UV_HANDLE_CLOSING' assertion error on Windows
    // Adding short delay to allow I/O to flush
    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
