
import hre from "hardhat";

const MNEE_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Funding accounts using MNEE at:", MNEE_ADDRESS);

    const mnee = await hre.ethers.getContractAt("MockMNEE", MNEE_ADDRESS);

    // Fund deployer (0xf39...)
    const tx1 = await mnee.mint(deployer.address, hre.ethers.parseEther("1000000"));
    await tx1.wait();
    console.log(`Funded ${deployer.address} with 1,000,000 MNEE`);

    // Fund FABB user (0xFABB...)
    const fabUser = "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a";
    const tx2 = await mnee.mint(fabUser, hre.ethers.parseEther("1000000"));
    await tx2.wait();
    console.log(`Funded ${fabUser} with 1,000,000 MNEE`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
