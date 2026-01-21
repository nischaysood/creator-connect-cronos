import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    const mneeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const creatorAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    const mnee = await ethers.getContractAt("MockMNEE", mneeAddress);

    console.log("Minting 1,000,000 MNEE to creator:", creatorAddress);
    const tx = await mnee.mint(creatorAddress, ethers.parseEther("1000000"));
    await tx.wait();

    const balance = await mnee.balanceOf(creatorAddress);
    console.log("New balance for creator:", ethers.formatEther(balance), "MNEE");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
