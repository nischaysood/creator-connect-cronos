import hre from "hardhat";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Using account:", signer.address);

    const ESCROW_ADDRESS = "0x21C99D4cBE98e673F770EaCF5972C44b41EaC12F";
    const Escrow = await hre.ethers.getContractFactory("CreatorConnectEscrow");
    const escrow = Escrow.attach(ESCROW_ADDRESS);

    const currentVerifier = await escrow.verifierAgent();
    console.log("Current Verifier:", currentVerifier);

    if (currentVerifier.toLowerCase() === signer.address.toLowerCase()) {
        console.log("Verifier is already the current account.");
        return;
    }

    console.log("Updating verifier to:", signer.address);
    const tx = await escrow.updateVerifier(signer.address);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Verifier updated successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
