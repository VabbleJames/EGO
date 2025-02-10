import { useCallback } from 'react';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';

export function useSettleDTF(dtfId) {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  // Get DTF data
  const { data: dtf } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'dtfs',
    args: [dtfId],
    enabled: Boolean(dtfId)
  });

  const checkSettlementConditions = useCallback(() => {
    if (!dtf) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = Number(dtf[2]) < currentTime; // expiryTime check
    const isNotSettled = !dtf[5]; // isSettled check

    return isExpired && isNotSettled;
  }, [dtf]);

  const settle = useCallback(async () => {
    if (!dtfId || !address) return;

    try {
      const canSettle = checkSettlementConditions();
      if (!canSettle) {
        console.log('DTF cannot be settled:', {
          dtfId: dtfId.toString(),
          reason: 'Not expired or already settled'
        });
        return;
      }

      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'settleDTF',
        args: [dtfId]
      });

      return hash;
    } catch (error) {
      console.error('Error settling DTF:', error);
      throw error;
    }
  }, [dtfId, address, checkSettlementConditions, writeContractAsync]);

  return {
    canSettle: checkSettlementConditions(),
    settle,
    dtf
  };
}