import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const agent = signers.length > 1 ? signers[1] : deployer;

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Agent address:", agent.address);

    // Use USDC on Cronos Testnet (devUSDC.e - Bridged USDC via Stargate)
    const usdcAddress = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
    console.log("Using USDC at:", usdcAddress);
    console.log("⚠️  Make sure to get USDC from Cronos testnet faucet: https://cronos.org/faucet");

    // Deploy Verifier Agent
    const verifierAgentAddress = agent.address;

    // Deploy Escrow
    const escrow = await ethers.deployContract("CreatorConnectEscrow", [
        usdcAddress,
        verifierAgentAddress
    ]);
    await escrow.waitForDeployment();
    console.log("CreatorConnectEscrow deployed to:", await escrow.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
