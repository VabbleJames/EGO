import { useReadContract, useReadContracts } from 'wagmi';
import DTFMarket from '../contracts/abis/DTFMarket.json';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';

export function useDTFData(dtfId) {
  // Fetch DTF base data
  const { data: dtf, isError: dtfError, isLoading: dtfLoading } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'dtfs',
    args: [BigInt(dtfId)],
    onSettled(data, error) {
      console.log('DTF Base Data Response:', {
        dtfId,
        data,
        error,
        contractAddress: SEPOLIA_CONTRACTS.DTF_MARKET
      });
    }
  });

  // Fetch additional data only if we have the base DTF data
  const { 
    data: additionalData, 
    isError: additionalError,
    isLoading: additionalLoading 
  } = useReadContracts({
    contracts: [
      {
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'getCurrentValuation',
        args: [BigInt(dtfId)],
      },
      {
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'getSharePrices',
        args: [BigInt(dtfId)],
      },
      {
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'getDTFPoolInfo',
        args: [BigInt(dtfId)],
      },
    ],
    enabled: Boolean(dtf),
  });

  // Extract individual values from additionalData array
  const [currentValuation, sharePrices, poolInfo] = additionalData || [];

  // Detailed logging for debugging
  console.log('DTF Data State:', {
    dtfId,
    hasBaseData: !!dtf,
    hasAdditionalData: !!additionalData,
    baseLoading: dtfLoading,
    additionalLoading,
    baseError: dtfError,
    additionalError,
    dtf,
    currentValuation,
    sharePrices,
    poolInfo
  });

  return {
    dtf,
    currentValuation,
    sharePrices,
    poolInfo,
    isError: dtfError || additionalError,
    // We're loading if either the base data or additional data is loading
    isLoading: dtfLoading || (Boolean(dtf) && additionalLoading),
    // Separate loading states if needed
    loadingStates: {
      baseLoading: dtfLoading,
      additionalLoading
    }
  };
}