// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorConnectEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdcToken;
    address public verifierAgent;

    struct Campaign {
        uint256 id;
        address brand;
        string details; // JSON or IPFS hash with requirements
        uint256 rewardPerCreator;
        uint256 maxCreators;
        uint256 totalDeposited;
        uint256 totalPaid;
        bool isActive;
        uint256 createdAt;
        uint256 deadline;
    }

    struct UserProfile {
        address wallet;
        string name;
        string bio;
        string avatar;
        string role; // "brand" or "creator"
        bool exists;
    }

    struct Enrollment {
        address creator;
        string submissionUrl;
        bool isVerified;
        bool isPaid;
        bool isRejected;
        uint256 joinedAt;
    }

    uint256 public nextCampaignId;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Enrollment[]) public campaignEnrollments;
    mapping(uint256 => mapping(address => bool)) public hasEnrolled;

    mapping(address => UserProfile) public profiles;
    address[] public allProfileAddresses;

    event ProfileUpdated(address indexed wallet, string name, string role);
    event CampaignCreated(uint256 indexed campaignId, address indexed brand, uint256 rewardPerCreator);
    event CreatorEnrolled(uint256 indexed campaignId, address indexed creator);
    event SubmissionVerified(uint256 indexed campaignId, address indexed creator, bool success);
    event PaymentReleased(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event CampaignFunded(uint256 indexed campaignId, uint256 amount);

    constructor(address _usdcToken, address _verifierAgent) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        verifierAgent = _verifierAgent;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifierAgent, "Only verifier agent can call this");
        _;
    }

    function createCampaign(
        string memory _details,
        uint256 _rewardPerCreator,
        uint256 _maxCreators,
        uint256 _durationDays
    ) external nonReentrant returns (uint256) {
        require(_rewardPerCreator > 0, "Reward must be > 0");
        require(_maxCreators > 0, "Max creators must be > 0");
        
        uint256 totalRequired = _rewardPerCreator * _maxCreators;
        // Transfer funds from brand to escrow
        usdcToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        uint256 campaignId = nextCampaignId++;
        campaigns[campaignId] = Campaign({
            id: campaignId,
            brand: msg.sender,
            details: _details,
            rewardPerCreator: _rewardPerCreator,
            maxCreators: _maxCreators,
            totalDeposited: totalRequired,
            totalPaid: 0,
            isActive: true,
            createdAt: block.timestamp,
            deadline: block.timestamp + (_durationDays * 1 days)
        });

        emit CampaignCreated(campaignId, msg.sender, _rewardPerCreator);
        emit CampaignFunded(campaignId, totalRequired);

        return campaignId;
    }

    function enroll(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign not active");
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(!hasEnrolled[_campaignId][msg.sender], "Already enrolled");
        require(campaignEnrollments[_campaignId].length < campaign.maxCreators, "Campaign full");
        // Extra check for "Budget Burn" (Capital-Based)
        require(campaign.totalPaid + (campaignEnrollments[_campaignId].length * campaign.rewardPerCreator) < campaign.totalDeposited, "No budget left");

        enrollments(_campaignId).push(Enrollment({
            creator: msg.sender,
            submissionUrl: "",
            isVerified: false,
            isPaid: false,
            isRejected: false,
            joinedAt: block.timestamp
        }));
        
        hasEnrolled[_campaignId][msg.sender] = true;
        emit CreatorEnrolled(_campaignId, msg.sender);
    }

    // Helper to access storage array
    function enrollments(uint256 _campaignId) internal view returns (Enrollment[] storage) {
        return campaignEnrollments[_campaignId];
    }

    function submitContent(uint256 _campaignId, string memory _url) external {
        require(hasEnrolled[_campaignId][msg.sender], "Not enrolled");
        
        Enrollment[] storage enrolled = campaignEnrollments[_campaignId];
        for (uint i = 0; i < enrolled.length; i++) {
            if (enrolled[i].creator == msg.sender) {
                require(!enrolled[i].isVerified, "Already verified");
                enrolled[i].submissionUrl = _url;
                enrolled[i].isRejected = false;
                break;
            }
        }
        // Emit event? Maybe just rely on enrollment update or explicit event if needed.
    }

    function verifyAndRelease(
        uint256 _campaignId,
        address _creator,
        bool _isValid,
        uint256 _payoutPercent
    ) external onlyVerifier nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign not active");

        Enrollment[] storage enrolled = campaignEnrollments[_campaignId];
        for (uint i = 0; i < enrolled.length; i++) {
            if (enrolled[i].creator == _creator) {
                require(!enrolled[i].isPaid, "Already paid");
                
                if (_isValid && _payoutPercent > 0) {
                    enrolled[i].isVerified = true;
                    enrolled[i].isPaid = true;
                    enrolled[i].isRejected = false;
                    
                    // Calculate dynamic payout
                    uint256 payment = (campaign.rewardPerCreator * _payoutPercent) / 100;
                    
                    campaign.totalPaid += payment;
                    usdcToken.safeTransfer(_creator, payment);
                    
                    emit PaymentReleased(_campaignId, _creator, payment);
                } else {
                    enrolled[i].isRejected = true;
                }
                
                emit SubmissionVerified(_campaignId, _creator, _isValid);
                return;
            }
        }
        revert("Creator not found in campaign");
    }

    function registerProfile(
        string memory _name,
        string memory _bio,
        string memory _avatar,
        string memory _role
    ) external {
        if (!profiles[msg.sender].exists) {
            allProfileAddresses.push(msg.sender);
        }
        
        profiles[msg.sender] = UserProfile({
            wallet: msg.sender,
            name: _name,
            bio: _bio,
            avatar: _avatar,
            role: _role,
            exists: true
        });

        emit ProfileUpdated(msg.sender, _name, _role);
    }

    function getAllProfileAddresses() external view returns (address[] memory) {
        return allProfileAddresses;
    }

    function updateVerifier(address _newVerifier) external onlyOwner {
        verifierAgent = _newVerifier;
    }

    function getCampaignEnrollments(uint256 _campaignId) external view returns (Enrollment[] memory) {
        return campaignEnrollments[_campaignId];
    }
    function toggleCampaignStatus(uint256 _campaignId, bool _isActive) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.brand, "Only brand can update status");
        
        campaign.isActive = _isActive;
    }

    function withdrawRemainingFunds(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.brand, "Only brand can withdraw");
        require(campaign.isActive || campaign.totalPaid < campaign.totalDeposited, "Nothing to withdraw");

        uint256 remaining = campaign.totalDeposited - campaign.totalPaid;
        require(remaining > 0, "No funds remaining");

        // Update state before transfer
        campaign.totalDeposited = campaign.totalPaid; // Set deposited to what was spent
        campaign.isActive = false; // Close campaign

        usdcToken.safeTransfer(msg.sender, remaining);
        
        emit CampaignFunded(_campaignId, 0); // Signal that funds are drained/adjusted
    }
}
