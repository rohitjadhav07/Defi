import { ethers } from 'ethers';

export interface TransferRequest {
  id: string;
  from: string;
  to: string;
  token: {
    symbol: string;
    address: string;
    decimals: number;
  };
  amount: string;
  chainId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  fee: string;
  estimatedTime: number; // seconds
  createdAt: number;
  completedAt?: number;
  memo?: string;
}

export interface AddressBook {
  id: string;
  name: string;
  address: string;
  chainId: number;
  isFavorite: boolean;
  addedAt: number;
}

export interface TransferHistory {
  transfers: TransferRequest[];
  totalSent: number;
  totalReceived: number;
  totalFees: number;
}

export class TransferService {
  private transfers: Map<string, TransferRequest>;
  private addressBook: Map<string, AddressBook>;

  constructor() {
    this.transfers = new Map();
    this.addressBook = new Map();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add some mock address book entries
    const mockAddresses: AddressBook[] = [
      {
        id: 'addr-1',
        name: 'My Hardware Wallet',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        chainId: 11155111,
        isFavorite: true,
        addedAt: Date.now() - 86400000 * 7,
      },
      {
        id: 'addr-2',
        name: 'Exchange Deposit',
        address: '0x1234567890123456789012345678901234567890',
        chainId: 11155111,
        isFavorite: true,
        addedAt: Date.now() - 86400000 * 14,
      },
      {
        id: 'addr-3',
        name: 'Friend - Alice',
        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        chainId: 84532,
        isFavorite: false,
        addedAt: Date.now() - 86400000 * 3,
      },
    ];

    mockAddresses.forEach(addr => this.addressBook.set(addr.id, addr));
  }

  async createTransfer(
    from: string,
    to: string,
    tokenSymbol: string,
    tokenAddress: string,
    amount: string,
    chainId: number,
    memo?: string
  ): Promise<TransferRequest> {
    // Validate address
    if (!ethers.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    // Calculate fee (mock)
    const fee = this.calculateFee(chainId, amount);
    const estimatedTime = this.estimateTime(chainId);

    const transfer: TransferRequest = {
      id: `transfer-${Date.now()}`,
      from,
      to,
      token: {
        symbol: tokenSymbol,
        address: tokenAddress,
        decimals: 18,
      },
      amount,
      chainId,
      status: 'pending',
      fee,
      estimatedTime,
      createdAt: Date.now(),
      memo,
    };

    this.transfers.set(transfer.id, transfer);
    return transfer;
  }

  async executeTransfer(transferId: string): Promise<TransferRequest> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) throw new Error('Transfer not found');

    // Update status to processing
    transfer.status = 'processing';

    // Note: Actual on-chain execution happens on frontend with user's wallet
    // This is just for tracking purposes
    // Real transaction will be sent from frontend using wagmi/viem

    return transfer;
  }

  async confirmTransfer(transferId: string, txHash: string): Promise<TransferRequest> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) throw new Error('Transfer not found');

    transfer.txHash = txHash;
    transfer.status = 'completed';
    transfer.completedAt = Date.now();

    return transfer;
  }

  async getTransferHistory(address: string): Promise<TransferHistory> {
    const userTransfers = Array.from(this.transfers.values()).filter(
      t => t.from === address || t.to === address
    );

    const totalSent = userTransfers
      .filter(t => t.from === address && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalReceived = userTransfers
      .filter(t => t.to === address && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalFees = userTransfers
      .filter(t => t.from === address && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.fee), 0);

    return {
      transfers: userTransfers.sort((a, b) => b.createdAt - a.createdAt),
      totalSent,
      totalReceived,
      totalFees,
    };
  }

  async addToAddressBook(
    name: string,
    address: string,
    chainId: number
  ): Promise<AddressBook> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address');
    }

    const entry: AddressBook = {
      id: `addr-${Date.now()}`,
      name,
      address,
      chainId,
      isFavorite: false,
      addedAt: Date.now(),
    };

    this.addressBook.set(entry.id, entry);
    return entry;
  }

  async getAddressBook(): Promise<AddressBook[]> {
    return Array.from(this.addressBook.values()).sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.addedAt - a.addedAt;
    });
  }

  async toggleFavorite(addressId: string): Promise<void> {
    const entry = this.addressBook.get(addressId);
    if (entry) {
      entry.isFavorite = !entry.isFavorite;
    }
  }

  async deleteFromAddressBook(addressId: string): Promise<void> {
    this.addressBook.delete(addressId);
  }

  private calculateFee(chainId: number, amount: string): string {
    // Different fees for different chains
    const feeRates: Record<number, number> = {
      11155111: 0.001, // Sepolia
      84532: 0.0001, // Base Sepolia
      421614: 0.0005, // Arbitrum Sepolia
    };

    const rate = feeRates[chainId] || 0.001;
    return (parseFloat(amount) * rate).toFixed(6);
  }

  private estimateTime(chainId: number): number {
    // Estimated confirmation time in seconds
    const times: Record<number, number> = {
      11155111: 15, // Sepolia ~15 seconds
      84532: 2, // Base Sepolia ~2 seconds
      421614: 1, // Arbitrum Sepolia ~1 second
    };

    return times[chainId] || 15;
  }

  async validateAddress(address: string): Promise<{
    valid: boolean;
    isContract: boolean;
    hasActivity: boolean;
  }> {
    const valid = ethers.isAddress(address);
    
    // In production: Check if it's a contract and has activity
    // For demo: return mock data
    return {
      valid,
      isContract: Math.random() > 0.8,
      hasActivity: Math.random() > 0.3,
    };
  }

  async estimateGas(
    from: string,
    to: string,
    amount: string,
    chainId: number
  ): Promise<{
    gasLimit: string;
    gasPrice: string;
    totalFee: string;
  }> {
    // Mock gas estimation
    // In production: Use ethers.js to estimate actual gas
    return {
      gasLimit: '21000',
      gasPrice: '20',
      totalFee: this.calculateFee(chainId, amount),
    };
  }

  async getRecentRecipients(address: string, limit: number = 5): Promise<string[]> {
    const transfers = Array.from(this.transfers.values())
      .filter(t => t.from === address && t.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(t => t.to);

    // Remove duplicates
    return [...new Set(transfers)];
  }
}
