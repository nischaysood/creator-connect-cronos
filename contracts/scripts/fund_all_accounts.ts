import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const mneeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("\n🚀 FUNDING ALL HARDHAT ACCOUNTS WITH MNEE...\n");

    const signers = await ethers.getSigners();
    const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);

    // Fund first 5 accounts
    for (let i = 0; i < 5; i++) {
        const addr = signers[i].address;
        const balance = await mnee.balanceOf(addr);

        if (balance < ethers.parseEther("100")) {
            console.log(`[${i}] ${addr} - Minting 10,000 MNEE...`);
            const tx = await mnee.mint(addr, ethers.parseEther("10000"));
            await tx.wait();
            console.log(`    ✅ Done`);
        } else {
            console.log(`[${i}] ${addr} - Already has ${ethers.formatEther(balance)} MNEE ✓`);
        }
    }

    // Also fund the custom user address if different
    const customUser = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a";
    const customBalance = await mnee.balanceOf(customUser);
    if (customBalance < ethers.parseEther("100")) {
        console.log(`\n[Custom] ${customUser} - Minting 10,000 MNEE...`);
        const tx = await mnee.mint(customUser, ethers.parseEther("10000"));
        await tx.wait();
        console.log(`    ✅ Done`);
    }

    console.log("\n✅ ALL ACCOUNTS FUNDED!\n");
    console.log("RECOMMENDED ACCOUNTS TO USE:");
    console.log("  Brand:   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Account #0)");
    console.log("  Creator: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Account #1)");
    console.log("\nPrivate Keys:");
    console.log("  #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    console.log("  #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d\n");

    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
