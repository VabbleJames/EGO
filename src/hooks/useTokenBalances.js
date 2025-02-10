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
  });

  return {
    USDC: balances?.[0] || 0n,
    LINK: balances?.[1] || 0n,
    AAVE: balances?.[2] || 0n,
  };
}