import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("CreatorConnectEscrow", function () {
    async function deployEscrowFixture() {
        const [owner, brand, creator, agent] = await ethers.getSigners();

        const MockMNEE = await ethers.getContractFactory("MockMNEE");
        const mnee = await MockMNEE.deploy();

        const CreatorConnectEscrow = await ethers.getContractFactory("CreatorConnectEscrow");
        const escrow = await CreatorConnectEscrow.deploy(await mnee.getAddress(), agent.address);

        // Mint MNEE to Brand
        await mnee.mint(brand.address, ethers.parseEther("1000"));

        return { mnee, escrow, owner, brand, creator, agent };
    }

    describe("Campaign Flow", function () {
        it("Should allow brand to create a campaign", async function () {
            const { mnee, escrow, brand } = await loadFixture(deployEscrowFixture);

            const reward = ethers.parseEther("100");
            const maxCreators = 2;
            const totalRequired = reward * BigInt(maxCreators);

            await mnee.connect(brand).approve(await escrow.getAddress(), totalRequired);

            await expect(escrow.connect(brand).createCampaign("Campaign Details", reward, maxCreators))
                .to.emit(escrow, "CampaignCreated")
                .withArgs(0, brand.address, reward);

            const campaign = await escrow.campaigns(0);
            expect(campaign.totalDeposited).to.equal(totalRequired);
        });

        it("Should allow creator to enroll and get paid after verification", async function () {
            const { mnee, escrow, brand, creator, agent } = await loadFixture(deployEscrowFixture);

            // Create Campaign
            const reward = ethers.parseEther("50");
            await mnee.connect(brand).approve(await escrow.getAddress(), ethers.parseEther("100"));
            await escrow.connect(brand).createCampaign("Details", reward, 2);

            // Enroll
            await escrow.connect(creator).enroll(0);
            const enrolled = await escrow.getCampaignEnrollments(0);
            expect(enrolled.length).to.equal(1);
            expect(enrolled[0].creator).to.equal(creator.address);

            // Submit
            await escrow.connect(creator).submitContent(0, "https://instagram.com/reel/123");

            // Verify (Agent)
            await expect(escrow.connect(agent).verifyAndRelease(0, creator.address, true))
                .to.emit(escrow, "PaymentReleased")
                .withArgs(0, creator.address, reward);

            // Check balance
            expect(await mnee.balanceOf(creator.address)).to.equal(reward);
        });

        it("Should fail if creator enrolls twice or campaign full", async function () {
            const { mnee, escrow, brand, creator } = await loadFixture(deployEscrowFixture);

            await mnee.connect(brand).approve(await escrow.getAddress(), ethers.parseEther("100"));
            await escrow.connect(brand).createCampaign("Details", ethers.parseEther("50"), 1);

            await escrow.connect(creator).enroll(0);
            await expect(escrow.connect(creator).enroll(0)).to.be.revertedWith("Already enrolled");
        });
    });
});
