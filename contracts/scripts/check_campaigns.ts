import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const escrowAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Ensure this matches deployment
    const Escrow = await ethers.getContractFactory("CreatorConnectEscrow");
    const escrow = Escrow.attach(escrowAddress);

    console.log("\n🔍 Checking Campaigns on-chain...");

    const code = await ethers.provider.getCode(escrowAddress);
    if (code === "0x") {
        console.error("❌ CRITICAL: No contract found at " + escrowAddress);
        console.error("👉 Solution: Restart 'npx hardhat node' and run 'npx hardhat run scripts/setup_full_test.ts --network localhost'");
        return;
    }

    try {
        const nextId = await escrow.nextCampaignId();
        console.log(`Total Campaigns Created: ${nextId}`);

        if (nextId == 0n) {
            console.log("❌ No campaigns found. Creation transaction likely failed.");
        } else {
            for (let i = 0; i < Number(nextId); i++) {
                const campaign = await escrow.campaigns(i);
                console.log(`\nCampaign #${i}:`);
                console.log(`- Details: ${campaign.details}`);
                console.log(`- Brand:   ${campaign.brand}`);
                console.log(`- Active:  ${campaign.isActive}`);
            }
        }

    } catch (error) {
        console.error("Error reading contract:", error);
    }
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
