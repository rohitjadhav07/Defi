// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DeFiCertificate
 * @dev NFT Certificate for DeFi University completions
 */
contract DeFiCertificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from address to earned certificates
    mapping(address => uint256[]) public userCertificates;
    
    // Mapping from certificate ID to metadata
    mapping(uint256 => CertificateData) public certificates;

    struct CertificateData {
        string courseName;
        string level;
        uint256 earnedAt;
        uint256 score;
    }

    event CertificateMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        string courseName,
        string level
    );

    constructor() ERC721("DeFi University Certificate", "DEFI-CERT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address to receive the certificate
     * @param courseName Name of the completed course
     * @param level Difficulty level (Beginner/Intermediate/Advanced)
     * @param score Quiz score (0-100)
     * @param tokenURI IPFS URI for certificate metadata
     */
    function mintCertificate(
        address recipient,
        string memory courseName,
        string memory level,
        uint256 score,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        certificates[newTokenId] = CertificateData({
            courseName: courseName,
            level: level,
            earnedAt: block.timestamp,
            score: score
        });

        userCertificates[recipient].push(newTokenId);

        emit CertificateMinted(recipient, newTokenId, courseName, level);

        return newTokenId;
    }

    /**
     * @dev Get all certificates owned by an address
     */
    function getCertificates(address owner) public view returns (uint256[] memory) {
        return userCertificates[owner];
    }

    /**
     * @dev Get certificate data
     */
    function getCertificateData(uint256 tokenId) public view returns (CertificateData memory) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificates[tokenId];
    }

    /**
     * @dev Get total number of certificates minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Override to prevent transfers (soulbound)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Prevent transfers (from != address(0) && to != address(0))
        require(
            from == address(0) || to == address(0),
            "Certificates are soulbound and cannot be transferred"
        );

        return super._update(to, tokenId, auth);
    }
}
