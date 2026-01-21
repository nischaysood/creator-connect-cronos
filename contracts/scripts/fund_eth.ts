import hre from "hardhat";
const { ethers } = hre;

async function main() {
    // The user's active address from previous logs
    const userAddress = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a";

    const [deployer] = await ethers.getSigners();

    console.log(`\n⛽ Checking ETH (Gas) balance for: ${userAddress}`);

    // Check current ETH balance
    const currentBalance = await ethers.provider.getBalance(userAddress);
    console.log(`Current Balance: ${ethers.formatEther(currentBalance)} ETH`);

    // Fund with 100 ETH
    console.log("Sending 100 Test ETH for gas fees...");

    const tx = await deployer.sendTransaction({
        to: userAddress,
        value: ethers.parseEther("100.0")
    });

    await tx.wait();

    const newBalance = await ethers.provider.getBalance(userAddress);
    console.log(`✅ Success! New Balance: ${ethers.formatEther(newBalance)} ETH`);

    // Explicit exit
    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
