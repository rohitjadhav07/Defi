// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserProfile
 * @dev On-chain user profile with KYC verification for DeFi Guardian AI
 */
contract UserProfile {
    
    enum KYCStatus { None, Pending, Verified, Rejected }
    enum VerificationLevel { None, Basic, Intermediate, Advanced }
    
    struct Profile {
        string username;
        string email; // Encrypted off-chain, only hash stored
        string avatarURI;
        uint256 createdAt;
        uint256 updatedAt;
        KYCStatus kycStatus;
        VerificationLevel verificationLevel;
        uint256 reputationScore; // 0-1000
        uint256 totalTrades;
        uint256 successfulTrades;
        bool isActive;
    }
    
    struct KYCData {
        bytes32 documentHash; // Hash of KYC documents
        uint256 submittedAt;
        uint256 verifiedAt;
        address verifier;
        string country;
        bool isVerified;
    }
    
    struct Achievement {
        string name;
        string description;
        uint256 earnedAt;
        string badgeURI;
    }
    
    // Mappings
    mapping(address => Profile) public profiles;
    mapping(address => KYCData) public kycData;
    mapping(address => Achievement[]) public achievements;
    mapping(address => bool) public isRegistered;
    mapping(string => address) public usernameToAddress;
    
    // Verifiers
    mapping(address => bool) public isVerifier;
    address public owner;
    
    // Events
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user);
    event KYCSubmitted(address indexed user, bytes32 documentHash);
    event KYCVerified(address indexed user, address verifier);
    event KYCRejected(address indexed user, address verifier);
    event AchievementEarned(address indexed user, string achievementName);
    event ReputationUpdated(address indexed user, uint256 newScore);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyVerifier() {
        require(isVerifier[msg.sender] || msg.sender == owner, "Not verifier");
        _;
    }
    
    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "Not registered");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        isVerifier[msg.sender] = true;
    }
    
    /**
     * @dev Create a new user profile
     */
    function createProfile(
        string memory _username,
        string memory _email,
        string memory _avatarURI
    ) external {
        require(!isRegistered[msg.sender], "Already registered");
        require(usernameToAddress[_username] == address(0), "Username taken");
        require(bytes(_username).length >= 3, "Username too short");
        
        profiles[msg.sender] = Profile({
            username: _username,
            email: _email,
            avatarURI: _avatarURI,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            kycStatus: KYCStatus.None,
            verificationLevel: VerificationLevel.None,
            reputationScore: 500, // Start at 500/1000
            totalTrades: 0,
            successfulTrades: 0,
            isActive: true
        });
        
        isRegistered[msg.sender] = true;
        usernameToAddress[_username] = msg.sender;
        
        emit ProfileCreated(msg.sender, _username);
    }
    
    /**
     * @dev Update user profile
     */
    function updateProfile(
        string memory _avatarURI
    ) external onlyRegistered {
        Profile storage profile = profiles[msg.sender];
        profile.avatarURI = _avatarURI;
        profile.updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender);
    }
    
    /**
     * @dev Submit KYC documents
     */
    function submitKYC(
        bytes32 _documentHash,
        string memory _country
    ) external onlyRegistered {
        require(
            profiles[msg.sender].kycStatus == KYCStatus.None ||
            profiles[msg.sender].kycStatus == KYCStatus.Rejected,
            "KYC already submitted or verified"
        );
        
        kycData[msg.sender] = KYCData({
            documentHash: _documentHash,
            submittedAt: block.timestamp,
            verifiedAt: 0,
            verifier: address(0),
            country: _country,
            isVerified: false
        });
        
        profiles[msg.sender].kycStatus = KYCStatus.Pending;
        
        emit KYCSubmitted(msg.sender, _documentHash);
    }
    
    /**
     * @dev Verify user KYC (only verifiers)
     */
    function verifyKYC(
        address _user,
        VerificationLevel _level
    ) external onlyVerifier {
        require(isRegistered[_user], "User not registered");
        require(profiles[_user].kycStatus == KYCStatus.Pending, "KYC not pending");
        
        profiles[_user].kycStatus = KYCStatus.Verified;
        profiles[_user].verificationLevel = _level;
        
        kycData[_user].isVerified = true;
        kycData[_user].verifiedAt = block.timestamp;
        kycData[_user].verifier = msg.sender;
        
        // Boost reputation for verified users
        profiles[_user].reputationScore += 100;
        if (profiles[_user].reputationScore > 1000) {
            profiles[_user].reputationScore = 1000;
        }
        
        emit KYCVerified(_user, msg.sender);
    }
    
    /**
     * @dev Reject user KYC (only verifiers)
     */
    function rejectKYC(address _user) external onlyVerifier {
        require(isRegistered[_user], "User not registered");
        require(profiles[_user].kycStatus == KYCStatus.Pending, "KYC not pending");
        
        profiles[_user].kycStatus = KYCStatus.Rejected;
        
        emit KYCRejected(_user, msg.sender);
    }
    
    /**
     * @dev Award achievement to user
     */
    function awardAchievement(
        address _user,
        string memory _name,
        string memory _description,
        string memory _badgeURI
    ) external onlyVerifier {
        require(isRegistered[_user], "User not registered");
        
        achievements[_user].push(Achievement({
            name: _name,
            description: _description,
            earnedAt: block.timestamp,
            badgeURI: _badgeURI
        }));
        
        // Boost reputation
        profiles[_user].reputationScore += 50;
        if (profiles[_user].reputationScore > 1000) {
            profiles[_user].reputationScore = 1000;
        }
        
        emit AchievementEarned(_user, _name);
    }
    
    /**
     * @dev Update reputation after trade
     */
    function updateTradeReputation(
        address _user,
        bool _successful
    ) external onlyVerifier {
        require(isRegistered[_user], "User not registered");
        
        Profile storage profile = profiles[_user];
        profile.totalTrades++;
        
        if (_successful) {
            profile.successfulTrades++;
            // Increase reputation
            profile.reputationScore += 5;
            if (profile.reputationScore > 1000) {
                profile.reputationScore = 1000;
            }
        } else {
            // Decrease reputation
            if (profile.reputationScore > 10) {
                profile.reputationScore -= 10;
            }
        }
        
        emit ReputationUpdated(_user, profile.reputationScore);
    }
    
    /**
     * @dev Get user profile
     */
    function getProfile(address _user) external view returns (
        string memory username,
        string memory avatarURI,
        uint256 createdAt,
        KYCStatus kycStatus,
        VerificationLevel verificationLevel,
        uint256 reputationScore,
        uint256 totalTrades,
        uint256 successfulTrades
    ) {
        Profile memory profile = profiles[_user];
        return (
            profile.username,
            profile.avatarURI,
            profile.createdAt,
            profile.kycStatus,
            profile.verificationLevel,
            profile.reputationScore,
            profile.totalTrades,
            profile.successfulTrades
        );
    }
    
    /**
     * @dev Get user achievements
     */
    function getAchievements(address _user) external view returns (Achievement[] memory) {
        return achievements[_user];
    }
    
    /**
     * @dev Add verifier (only owner)
     */
    function addVerifier(address _verifier) external onlyOwner {
        isVerifier[_verifier] = true;
    }
    
    /**
     * @dev Remove verifier (only owner)
     */
    function removeVerifier(address _verifier) external onlyOwner {
        isVerifier[_verifier] = false;
    }
    
    /**
     * @dev Get success rate
     */
    function getSuccessRate(address _user) external view returns (uint256) {
        Profile memory profile = profiles[_user];
        if (profile.totalTrades == 0) return 0;
        return (profile.successfulTrades * 100) / profile.totalTrades;
    }
}
