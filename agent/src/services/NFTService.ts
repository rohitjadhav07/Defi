import { ethers } from 'ethers';
import axios from 'axios';

// DeFiCertificate contract ABI (minimal)
const CERTIFICATE_ABI = [
  'function mintCertificate(address recipient, string courseName, string level, uint256 score, string tokenURI) returns (uint256)',
  'function getCertificates(address owner) view returns (uint256[])',
  'function getCertificateData(uint256 tokenId) view returns (tuple(string courseName, string level, uint256 earnedAt, uint256 score))',
  'function totalSupply() view returns (uint256)'
];

export interface Certificate {
  id: string;
  name: string;
  level: string;
  earnedAt: string;
  score: number;
  nftTokenId?: string;
  transactionHash?: string;
  ipfsUri?: string;
}

export class NFTService {
  private contractAddress: string;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    // Contract address (will be set after deployment)
    this.contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS || '';
    
    // Connect to Base Sepolia
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Signer (backend wallet that pays for minting)
    const privateKey = process.env.MINTER_PRIVATE_KEY || '';
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    // Contract instance
    this.contract = new ethers.Contract(
      this.contractAddress,
      CERTIFICATE_ABI,
      this.signer
    );
  }

  /**
   * Upload certificate metadata to IPFS
   */
  private async uploadToIPFS(metadata: any): Promise<string> {
    try {
      // Use Pinata API (free tier)
      const pinataApiKey = process.env.PINATA_API_KEY || '';
      const pinataSecretKey = process.env.PINATA_SECRET_KEY || '';

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback: use a placeholder URI
      return `ipfs://QmPlaceholder${Date.now()}`;
    }
  }

  /**
   * Mint a real NFT certificate
   */
  async mintCertificate(
    recipientAddress: string,
    courseName: string,
    level: string,
    score: number
  ): Promise<{
    success: boolean;
    tokenId?: number;
    transactionHash?: string;
    ipfsUri?: string;
    error?: string;
  }> {
    try {
      // 1. Create metadata
      const metadata = {
        name: `${courseName} Certificate`,
        description: `DeFi University Certificate for completing ${courseName}`,
        image: `https://defi-university.com/certificates/${level.toLowerCase()}.png`,
        attributes: [
          { trait_type: 'Course', value: courseName },
          { trait_type: 'Level', value: level },
          { trait_type: 'Score', value: score },
          { trait_type: 'Earned Date', value: new Date().toISOString() },
        ],
      };

      // 2. Upload to IPFS
      const ipfsUri = await this.uploadToIPFS(metadata);

      // 3. Mint NFT on-chain
      const tx = await this.contract.mintCertificate(
        recipientAddress,
        courseName,
        level,
        score,
        ipfsUri
      );

      // 4. Wait for confirmation
      const receipt = await tx.wait();

      // 5. Extract token ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'CertificateMinted';
        } catch {
          return false;
        }
      });

      let tokenId = 0;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        tokenId = Number(parsed?.args?.tokenId || 0);
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash,
        ipfsUri,
      };
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to mint NFT',
      };
    }
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(address: string): Promise<Certificate[]> {
    try {
      const tokenIds = await this.contract.getCertificates(address);
      const certificates: Certificate[] = [];

      for (const tokenId of tokenIds) {
        const data = await this.contract.getCertificateData(tokenId);
        certificates.push({
          id: `cert-${tokenId}`,
          name: `${data.courseName} Certificate`,
          level: data.level,
          earnedAt: new Date(Number(data.earnedAt) * 1000).toISOString(),
          score: Number(data.score),
          nftTokenId: tokenId.toString(),
        });
      }

      return certificates;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  /**
   * Get total certificates minted
   */
  async getTotalSupply(): Promise<number> {
    try {
      const total = await this.contract.totalSupply();
      return Number(total);
    } catch (error) {
      console.error('Error fetching total supply:', error);
      return 0;
    }
  }
}
