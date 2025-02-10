import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { erc20Abi } from 'viem';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';

export function useTokenApprovals() {
  const { writeContract } = useWriteContract();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Function to check current allowance
  const checkAllowance = async (tokenAddress, userAddress, spenderAddress) => {
    try {
      if (!tokenAddress || !userAddress || !spenderAddress) {
        return 0n;
      }

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, spenderAddress],
      });
      
      return allowance;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return 0n;
    }
  };

  // Function to approve token spending
  const approveToken = async (tokenAddress, spenderAddress, amount) => {
    try {
      console.log(`Approving ${spenderAddress} to spend ${amount} of token ${tokenAddress}`);
      
      const tx = await writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount],
      });
  
      return tx;
    } catch (error) {
      console.error('Token approval error:', error);
      throw error;
    }
  };

  return {
    checkAllowance,
    approveToken
  };
}