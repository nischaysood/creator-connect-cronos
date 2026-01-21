import hre from "hardhat";
const { ethers } = hre;

const USER_ADDRESS = "0xfabb0ac9d68b0b445fb7357272ff202c5651694a";

async function main() {
    console.log("\n=================================================");
    console.log("🔍 FULL SYSTEM DIAGNOSTIC");
    console.log("=================================================\n");

    const [deployer] = await ethers.getSigners();

    // --- Step 1: Check if contracts exist ---
    console.log("1️⃣  Checking Contract Deployment...");

    const mneeAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
    const escrowAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";

    const mneeCode = await ethers.provider.getCode(mneeAddress);
    const escrowCode = await ethers.provider.getCode(escrowAddress);

    if (mneeCode === "0x" || escrowCode === "0x") {
        console.log("   ❌ Contracts NOT deployed. Run setup_full_test.ts first!");
        console.log("   CMD: npx hardhat run scripts/setup_full_test.ts --network localhost\n");
        setTimeout(() => process.exit(1), 500);
        return;
    }
    console.log("   ✅ MNEE Contract: " + mneeAddress);
    console.log("   ✅ Escrow Contract: " + escrowAddress);

    // --- Step 2: Check User ETH ---
    console.log("\n2️⃣  Checking User Wallet (ETH)...");
    const userEth = await ethers.provider.getBalance(USER_ADDRESS);
    console.log(`   - Address: ${USER_ADDRESS}`);
    console.log(`   - ETH Balance: ${ethers.formatEther(userEth)} ETH`);

    if (userEth < ethers.parseEther("0.1")) {
        console.log("   ⚠️  Low ETH. Sending 100 ETH...");
        const tx = await deployer.sendTransaction({
            to: USER_ADDRESS,
            value: ethers.parseEther("100.0")
        });
        await tx.wait();
        console.log("   ✅ 100 ETH sent!");
    } else {
        console.log("   ✅ ETH Balance OK");
    }

    // --- Step 3: Check User MNEE ---
    console.log("\n3️⃣  Checking User Wallet (MNEE)...");
    const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);
    const userMnee = await mnee.balanceOf(USER_ADDRESS);
    console.log(`   - MNEE Balance: ${ethers.formatEther(userMnee)} MNEE`);

    if (userMnee < ethers.parseEther("100")) {
        console.log("   ⚠️  Low MNEE. Minting 10,000 MNEE...");
        const tx = await mnee.mint(USER_ADDRESS, ethers.parseEther("10000"));
        await tx.wait();
        console.log("   ✅ 10,000 MNEE minted!");
    } else {
        console.log("   ✅ MNEE Balance OK");
    }

    // --- Step 4: Check Campaigns ---
    console.log("\n4️⃣  Checking Existing Campaigns...");
    const escrow = await ethers.getContractAt("CreatorConnectEscrow", escrowAddress);
    const nextId = await escrow.nextCampaignId();
    console.log(`   - Total Campaigns: ${nextId}`);

    // --- Summary ---
    console.log("\n=================================================");
    console.log("✅ DIAGNOSTIC COMPLETE - ALL SYSTEMS GO!");
    console.log("=================================================");
    console.log("\n📋 NEXT STEPS:");
    console.log("   1. Restart Frontend: Stop and run 'npm run dev' again");
    console.log("   2. MetaMask: Settings > Advanced > Clear Activity Data");
    console.log("   3. Import MNEE Token: Contract " + mneeAddress);
    console.log("   4. Test: Create a Campaign from the Dashboard\n");

    setTimeout(() => process.exit(0), 1000);
}

main().catch((error) => {
    console.error("❌ DIAGNOSTIC FAILED:", error.message);
    process.exit(1);
});
