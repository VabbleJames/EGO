import { useReadContracts } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import { erc20Abi } from 'viem';

export function useTokenBalances(address) {
  const { data: balances } = useReadContracts({
    contracts: [
      {
        address: SEPOLIA_CONTRACTS.TOKENS.USDC,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: SEPOLIA_CONTRACTS.TOKENS.LINK,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: SEPOLIA_CONTRACTS.TOKENS.AAVE,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
    ],
    // Enable only when we have an address
    enabled: Boolean(address),
  });

  // Debug log to see the structure
  console.log('Raw balance data:', balances);

  return {
    USDC: balances?.[0]?.result || 0n,
    LINK: balances?.[1]?.result || 0n,
    AAVE: balances?.[2]?.result || 0n,
  };
}