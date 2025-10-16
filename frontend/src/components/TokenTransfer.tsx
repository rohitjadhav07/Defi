'use client';

import { Send, Book, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther, parseUnits, encodeFunctionData } from 'viem';

// ERC20 Token addresses on Sepolia testnet
const TOKEN_ADDRESSES: Record<string, string> = {
  ETH: '0x0000000000000000000000000000000000000000',
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
  DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // Sepolia DAI
  WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03', // Sepolia WBTC
};

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export default function TokenTransfer() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [pendingTransferId, setPendingTransferId] = useState<string | null>(null);

  // Wagmi hooks for on-chain transactions
  const { data: ethHash, sendTransaction, isPending: isSendingETH } = useSendTransaction();
  const { data: erc20Hash, writeContract, isPending: isSendingERC20 } = useWriteContract();
  
  // Use the appropriate hash based on token type
  const hash = selectedToken === 'ETH' ? ethHash : erc20Hash;
  const isSending = selectedToken === 'ETH' ? isSendingETH : isSendingERC20;
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: addressBook = [] } = useQuery({
    queryKey: ['addressbook'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/transfer/addressbook`);
      if (!response.ok) throw new Error('Failed to fetch address book');
      return response.json();
    },
  });

  const { data: history } = useQuery({
    queryKey: ['transfer-history', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/transfer/history/${address}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },
    enabled: !!address,
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/transfer/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create transfer');
      return response.json();
    },
    onSuccess: (transfer) => {
      setPendingTransferId(transfer.id);
      
      // Execute real on-chain transaction based on token type
      if (selectedToken === 'ETH') {
        // Native ETH transfer
        sendTransaction({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        });
      } else {
        // ERC20 token transfer
        const tokenAddress = TOKEN_ADDRESSES[selectedToken];
        const decimals = selectedToken === 'WBTC' ? 8 : 18; // WBTC has 8 decimals
        
        writeContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parseUnits(amount, decimals)],
        });
      }
    },
  });

  const confirmTransferMutation = useMutation({
    mutationFn: async ({ transferId, txHash }: { transferId: string; txHash: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/transfer/${transferId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });
      if (!response.ok) throw new Error('Failed to confirm transfer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history', address] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', address] });
      setRecipient('');
      setAmount('');
      setMemo('');
      setPendingTransferId(null);
    },
  });

  // Confirm transfer when transaction is successful
  if (isSuccess && hash && pendingTransferId) {
    confirmTransferMutation.mutate({ transferId: pendingTransferId, txHash: hash });
  }

  const handleSend = () => {
    if (!address || !recipient || !amount) return;

    // Create transfer record first
    createTransferMutation.mutate({
      from: address,
      to: recipient,
      tokenSymbol: selectedToken,
      tokenAddress: TOKEN_ADDRESSES[selectedToken],
      amount,
      chainId: 11155111, // Sepolia testnet
      memo,
    });
  };

  return (
    <div className="space-y-6">
      {/* Send Token Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-500" />
          Send Tokens
        </h2>

        <div className="space-y-4">
          {/* Token Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="ETH">ETH - Ethereum</option>
              <option value="USDC">USDC - USD Coin</option>
              <option value="USDT">USDT - Tether</option>
              <option value="DAI">DAI - Dai Stablecoin</option>
              <option value="WBTC">WBTC - Wrapped Bitcoin</option>
            </select>
          </div>

          {/* Recipient Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Recipient Address</label>
              <button
                onClick={() => setShowAddressBook(!showAddressBook)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Book className="w-4 h-4" />
                Address Book
              </button>
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            
            {showAddressBook && addressBook.length > 0 && (
              <div className="mt-2 bg-gray-900 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                {addressBook.map((entry: any) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setRecipient(entry.address);
                      setShowAddressBook(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm">{entry.name}</p>
                      <p className="text-xs text-gray-400">{entry.address.substring(0, 10)}...</p>
                    </div>
                    {entry.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-20 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setAmount('1.0')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300"
              >
                MAX
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fee: ~0.001 {selectedToken} | Time: ~15 seconds
            </p>
          </div>

          {/* Memo (Optional) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Memo (Optional)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note..."
              maxLength={100}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!recipient || !amount || isSending || isConfirming}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Confirm in Wallet...
              </>
            ) : isConfirming ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Confirming on-chain...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Transfer Complete!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send {selectedToken} (On-Chain)
              </>
            )}
          </button>

          {/* Transaction Status */}
          {hash && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400 mb-1">✅ Transaction Submitted</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline break-all"
              >
                View on Etherscan: {hash}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Transfer History */}
      {history && history.transfers.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Transfers</h3>
          <div className="space-y-3">
            {history.transfers.slice(0, 10).map((transfer: any) => (
              <div key={transfer.id} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {transfer.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : transfer.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="font-semibold">
                      {transfer.from === address ? 'Sent' : 'Received'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {transfer.from === address ? 'To' : 'From'}: {' '}
                    {(transfer.from === address ? transfer.to : transfer.from).substring(0, 10)}...
                  </span>
                  <span className="font-bold">
                    {transfer.amount} {transfer.token.symbol}
                  </span>
                </div>
                {transfer.memo && (
                  <p className="text-xs text-gray-500 mt-2">📝 {transfer.memo}</p>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Total Sent</p>
              <p className="text-lg font-bold">{history.totalSent.toFixed(4)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Total Received</p>
              <p className="text-lg font-bold text-green-500">{history.totalReceived.toFixed(4)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Total Fees</p>
              <p className="text-lg font-bold text-gray-500">{history.totalFees.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
