import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const userAddress = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a";
    const mneeAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

    console.log(`\n🕵️ Verifying User Ready: ${userAddress}`);

    // 1. Check ETH
    const ethParams = await ethers.provider.getBalance(userAddress);
    const eth = ethers.formatEther(ethParams);
    console.log(`- ETH Balance:  ${eth} ETH`);

    // 2. Check MNEE
    let mnee = "0.0";
    try {
        const token = await ethers.getContractAt("MockMNEE", mneeAddress);
        const bal = await token.balanceOf(userAddress);
        mnee = ethers.formatEther(bal);
        console.log(`- MNEE Balance: ${mnee} MNEE`);
    } catch (e) {
        console.log("- MNEE Balance: ERROR (Contract likely missing)");
    }

    console.log("------------------------------------------");
    if (Number(eth) > 0 && Number(mnee) >= 100) {
        console.log("✅ USER IS 100% READY TO CREATE CAMPAIGN!");
    } else {
        console.log("❌ USER NOT READY. Balances insufficient.");
    }

    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
