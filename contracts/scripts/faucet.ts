import hre from "hardhat";
const { ethers } = hre;

async function main() {
    // GET ADDRESS FROM COMMAND LINE
    const targetAddress = process.env.ADDR;

    if (!targetAddress) {
        console.log("\n❌ ERROR: No address provided!");
        console.log("Usage: ADDR=0xYourAddress npx hardhat run scripts/faucet.ts --network localhost\n");
        process.exit(1);
    }

    const mneeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const [deployer] = await ethers.getSigners();

    console.log(`\n💧 FAUCET: Funding ${targetAddress}...\n`);

    // 1. Send ETH
    console.log("⛽ Sending 100 ETH for gas...");
    const tx1 = await deployer.sendTransaction({
        to: targetAddress,
        value: ethers.parseEther("100.0")
    });
    await tx1.wait();
    console.log("   ✅ ETH Sent");

    // 2. Mint MNEE
    console.log("💰 Minting 10,000 MNEE...");
    const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);
    const tx2 = await mnee.mint(targetAddress, ethers.parseEther("10000"));
    await tx2.wait();
    console.log("   ✅ MNEE Minted");

    // 3. Confirm
    const ethBal = await ethers.provider.getBalance(targetAddress);
    const mneeBal = await mnee.balanceOf(targetAddress);

    console.log("\n✅ FUNDING COMPLETE!");
    console.log(`   ETH Balance:  ${ethers.formatEther(ethBal)} ETH`);
    console.log(`   MNEE Balance: ${ethers.formatEther(mneeBal)} MNEE\n`);

    setTimeout(() => process.exit(0), 500);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
