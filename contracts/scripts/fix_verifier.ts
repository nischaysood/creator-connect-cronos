
import hre from "hardhat";

const ESCROW_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Updating Verifier Agent...");
    console.log("Contract:", ESCROW_ADDRESS);
    console.log("New Verifier (Backend Sender):", deployer.address);

    const escrow = await hre.ethers.getContractAt("CreatorConnectEscrow", ESCROW_ADDRESS);

    // Check current verifier
    const currentVerifier = await escrow.verifierAgent();
    console.log("Current Verifier:", currentVerifier);

    if (currentVerifier === deployer.address) {
        console.log("Verifier is already set correctly.");
        return;
    }

    // Update verifier to deployer (Account #0) because that's what the API route uses
    const tx = await escrow.updateVerifier(deployer.address);
    await tx.wait();

    console.log("✅ Verifier updated successfully to:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
