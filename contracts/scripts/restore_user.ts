import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const userAddress = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a"; // User's active address
    // Addresses from deploy.ts
    const mneeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const [deployer] = await ethers.getSigners();

    console.log(`\n🚑 RESTORING USER: ${userAddress}`);
    console.log("-----------------------------------------------");

    // 1. Fund ETH (Gas)
    const currentEth = await ethers.provider.getBalance(userAddress);
    console.log(`Current ETH: ${ethers.formatEther(currentEth)}`);

    if (currentEth < ethers.parseEther("1.0")) {
        console.log("⛽ Sending 100 ETH for gas...");
        const tx1 = await deployer.sendTransaction({
            to: userAddress,
            value: ethers.parseEther("100.0")
        });
        await tx1.wait();
        console.log("   ✅ ETH Sent");
    } else {
        console.log("   ✅ ETH Balance Sufficient");
    }

    // 2. Fund MNEE (Tokens)
    try {
        const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);
        const currentMnee = await mnee.balanceOf(userAddress);
        console.log(`Current MNEE: ${ethers.formatEther(currentMnee)}`);

        if (currentMnee < ethers.parseEther("100.0")) {
            console.log("💰 Minting 10,000 MNEE...");
            const tx2 = await mnee.mint(userAddress, ethers.parseEther("10000.0"));
            await tx2.wait();
            console.log("   ✅ MNEE Minted");
        } else {
            console.log("   ✅ MNEE Balance Sufficient");
        }
    } catch (e) {
        console.error("   ❌ Failed to connect to MNEE contract. Check address in script.");
    }

    console.log("-----------------------------------------------");
    console.log("✅ RESTORE COMPLETE. User can now transact.");

    // Exit safely
    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
