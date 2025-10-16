import { useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';

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

// Common testnet token addresses
const TOKEN_ADDRESSES: Record<string, Record<number, string>> = {
  USDC: {
    11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
    421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  },
  USDT: {
    11155111: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT
    84532: '0x0000000000000000000000000000000000000000', // Base Sepolia USDT (placeholder)
    421614: '0x0000000000000000000000000000000000000000', // Arbitrum Sepolia USDT (placeholder)
  },
  DAI: {
    11155111: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6', // Sepolia DAI
    84532: '0x0000000000000000000000000000000000000000', // Base Sepolia DAI (placeholder)
    421614: '0x0000000000000000000000000000000000000000', // Arbitrum Sepolia DAI (placeholder)
  },
};

export function useTokenTransfer(tokenSymbol: string, chainId: number = 11155111) {
  const { sendTransaction, data: ethHash, isPending: isEthPending } = useSendTransaction();
  const { writeContract, data: erc20Hash, isPending: isErc20Pending } = useWriteContract();

  const isNativeToken = tokenSymbol === 'ETH';
  const hash = isNativeToken ? ethHash : erc20Hash;
  const isPending = isNativeToken ? isEthPending : isErc20Pending;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const transfer = async (to: string, amount: string) => {
    if (isNativeToken) {
      // Send native ETH
      sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      });
    } else {
      // Send ERC20 token
      const tokenAddress = TOKEN_ADDRESSES[tokenSymbol]?.[chainId];
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`${tokenSymbol} not available on this chain`);
      }

      // Parse amount based on token decimals (assuming 6 for USDC/USDT, 18 for others)
      const decimals = tokenSymbol === 'USDC' || tokenSymbol === 'USDT' ? 6 : 18;
      const parsedAmount = parseUnits(amount, decimals);

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
      });
    }
  };

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}
