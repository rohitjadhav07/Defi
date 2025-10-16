import { ethers } from 'ethers';

export enum KYCStatus {
  None = 0,
  Pending = 1,
  Verified = 2,
  Rejected = 3,
}

export enum VerificationLevel {
  None = 0,
  Basic = 1,
  Intermediate = 2,
  Advanced = 3,
}

export interface UserProfile {
  address: string;
  username: string;
  email?: string;
  avatarURI?: string;
  createdAt: number;
  updatedAt: number;
  kycStatus: KYCStatus;
  verificationLevel: VerificationLevel;
  reputationScore: number;
  totalTrades: number;
  successfulTrades: number;
  successRate: number;
  isActive: boolean;
  achievements: Achievement[];
}

export interface Achievement {
  name: string;
  description: string;
  earnedAt: number;
  badgeURI: string;
}

export interface KYCSubmission {
  documentHash: string;
  country: string;
  submittedAt: number;
}

export class ProfileService {
  private profiles: Map<string, UserProfile>;
  
  // Contract addresses (deployed on testnets)
  private contractAddresses = {
    11155111: '0x0000000000000000000000000000000000000000', // Sepolia
    84532: '0x0000000000000000000000000000000000000000', // Base Sepolia
    421614: '0x0000000000000000000000000000000000000000', // Arbitrum Sepolia
  };

  constructor() {
    this.profiles = new Map();
    this.initializeMockProfiles();
  }

  private initializeMockProfiles() {
    // Create some mock profiles for demo
    const mockProfiles: UserProfile[] = [
      {
        address: '0x1234567890123456789012345678901234567890',
        username: 'CryptoTrader',
        email: 'trader@example.com',
        avatarURI: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoTrader',
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now(),
        kycStatus: KYCStatus.Verified,
        verificationLevel: VerificationLevel.Advanced,
        reputationScore: 850,
        totalTrades: 47,
        successfulTrades: 45,
        successRate: 95.7,
        isActive: true,
        achievements: [
          {
            name: 'First Trade',
            description: 'Completed your first trade',
            earnedAt: Date.now() - 86400000 * 29,
            badgeURI: '🎯',
          },
          {
            name: 'KYC Verified',
            description: 'Successfully verified your identity',
            earnedAt: Date.now() - 86400000 * 28,
            badgeURI: '✅',
          },
        ],
      },
    ];

    mockProfiles.forEach(profile => {
      this.profiles.set(profile.address.toLowerCase(), profile);
    });
  }

  async getProfile(address: string): Promise<UserProfile | null> {
    // In production: Query blockchain contract
    // For demo: Return mock data or create new profile
    
    const normalizedAddress = address.toLowerCase();
    let profile = this.profiles.get(normalizedAddress);

    if (!profile) {
      // Create default profile
      profile = {
        address,
        username: `User${address.substring(2, 8)}`,
        avatarURI: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        kycStatus: KYCStatus.None,
        verificationLevel: VerificationLevel.None,
        reputationScore: 500,
        totalTrades: 0,
        successfulTrades: 0,
        successRate: 0,
        isActive: true,
        achievements: [],
      };
      this.profiles.set(normalizedAddress, profile);
    }

    return profile;
  }

  async createProfile(
    address: string,
    username: string,
    email?: string,
    avatarURI?: string
  ): Promise<UserProfile> {
    const normalizedAddress = address.toLowerCase();
    
    // Check if username is taken
    const existingProfile = Array.from(this.profiles.values()).find(
      p => p.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingProfile) {
      throw new Error('Username already taken');
    }

    const profile: UserProfile = {
      address,
      username,
      email,
      avatarURI: avatarURI || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      kycStatus: KYCStatus.None,
      verificationLevel: VerificationLevel.None,
      reputationScore: 500,
      totalTrades: 0,
      successfulTrades: 0,
      successRate: 0,
      isActive: true,
      achievements: [
        {
          name: 'Welcome!',
          description: 'Created your DeFi Guardian profile',
          earnedAt: Date.now(),
          badgeURI: '🎉',
        },
      ],
    };

    this.profiles.set(normalizedAddress, profile);
    return profile;
  }

  async updateProfile(
    address: string,
    updates: Partial<Pick<UserProfile, 'username' | 'email' | 'avatarURI'>>
  ): Promise<UserProfile> {
    const profile = await this.getProfile(address);
    if (!profile) throw new Error('Profile not found');

    if (updates.username) profile.username = updates.username;
    if (updates.email) profile.email = updates.email;
    if (updates.avatarURI) profile.avatarURI = updates.avatarURI;
    profile.updatedAt = Date.now();

    return profile;
  }

  async submitKYC(
    address: string,
    documents: { type: string; hash: string }[],
    country: string
  ): Promise<void> {
    const profile = await this.getProfile(address);
    if (!profile) throw new Error('Profile not found');

    if (profile.kycStatus === KYCStatus.Verified) {
      throw new Error('Already verified');
    }

    // In production: Store document hashes on-chain
    // For demo: Update status
    profile.kycStatus = KYCStatus.Pending;
    profile.updatedAt = Date.now();
  }

  async verifyKYC(
    address: string,
    level: VerificationLevel
  ): Promise<void> {
    const profile = await this.getProfile(address);
    if (!profile) throw new Error('Profile not found');

    profile.kycStatus = KYCStatus.Verified;
    profile.verificationLevel = level;
    profile.reputationScore += 100;
    if (profile.reputationScore > 1000) profile.reputationScore = 1000;

    // Award achievement
    profile.achievements.push({
      name: 'KYC Verified',
      description: `Achieved ${VerificationLevel[level]} verification`,
      earnedAt: Date.now(),
      badgeURI: '✅',
    });

    profile.updatedAt = Date.now();
  }

  async updateTradeStats(
    address: string,
    successful: boolean
  ): Promise<void> {
    const profile = await this.getProfile(address);
    if (!profile) throw new Error('Profile not found');

    profile.totalTrades++;
    if (successful) {
      profile.successfulTrades++;
      profile.reputationScore += 5;
    } else {
      profile.reputationScore = Math.max(0, profile.reputationScore - 10);
    }

    if (profile.reputationScore > 1000) profile.reputationScore = 1000;
    profile.successRate = (profile.successfulTrades / profile.totalTrades) * 100;

    // Award milestones
    if (profile.totalTrades === 1) {
      profile.achievements.push({
        name: 'First Trade',
        description: 'Completed your first trade',
        earnedAt: Date.now(),
        badgeURI: '🎯',
      });
    } else if (profile.totalTrades === 10) {
      profile.achievements.push({
        name: 'Experienced Trader',
        description: 'Completed 10 trades',
        earnedAt: Date.now(),
        badgeURI: '⭐',
      });
    } else if (profile.totalTrades === 50) {
      profile.achievements.push({
        name: 'Trading Master',
        description: 'Completed 50 trades',
        earnedAt: Date.now(),
        badgeURI: '🏆',
      });
    }

    profile.updatedAt = Date.now();
  }

  async awardAchievement(
    address: string,
    achievement: Achievement
  ): Promise<void> {
    const profile = await this.getProfile(address);
    if (!profile) throw new Error('Profile not found');

    profile.achievements.push(achievement);
    profile.reputationScore += 50;
    if (profile.reputationScore > 1000) profile.reputationScore = 1000;
    profile.updatedAt = Date.now();
  }

  getKYCStatusLabel(status: KYCStatus): string {
    return KYCStatus[status];
  }

  getVerificationLevelLabel(level: VerificationLevel): string {
    return VerificationLevel[level];
  }

  getReputationTier(score: number): string {
    if (score >= 900) return 'Legendary';
    if (score >= 800) return 'Expert';
    if (score >= 700) return 'Advanced';
    if (score >= 600) return 'Intermediate';
    if (score >= 500) return 'Beginner';
    return 'Novice';
  }
}
