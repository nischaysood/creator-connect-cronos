import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const userAddress = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a"; // The user's current address from logs
    const mneeAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // MNEE Address from Step 298

    console.log(`\n💰 Minting MNEE to user address: ${userAddress}...`);

    try {
        const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);
        const [deployer] = await ethers.getSigners();

        console.log(" Minting 10,000 MNEE...");
        const tx = await mnee.mint(userAddress, ethers.parseEther("10000"));
        await tx.wait();

        const balance = await mnee.balanceOf(userAddress);
        console.log(`✅ Success! New Balance: ${ethers.formatEther(balance)} MNEE`);
        console.log("👉 You can now create the campaign.");

    } catch (error) {
        console.error("Error minting:", error);
    }

    // Explicit exit to prevent Windows hang
    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
