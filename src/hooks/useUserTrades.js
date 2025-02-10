import { useState, useEffect } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';

async function fetchTradePrice(address, dtfId) {
  try {
    const response = await fetch(`/api/trades/${address}/${dtfId}/price`);
    const data = await response.json();
    return data.entryPrice;
  } catch {
    return 0;
  }
}

export function useUserTrades() {
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [timestamp, setTimestamp] = useState(Date.now()); 
  const { data: nextDtfId } = useReadContract({
  
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: [{
      "inputs": [],
      "name": "nextDtfId",
      "outputs": [{ "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'nextDtfId'
  });

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/v1/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'DTFSettled') {
        setTimestamp(Date.now());
      }
    };

    return () => eventSource.close();
  }, [address, queryClient]);

  const { data: trades, refetch: queryRefetch } = useQuery({
    queryKey: ['trades', address, timestamp],
    queryFn: async () => {
      if (!address) return [];
      
      console.log('Fetching trades for address:', address, 'at timestamp:', timestamp);
      
      try {
        const response = await fetch(
          `http://localhost:3001/api/v1/trades/${address}?t=${timestamp}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch trades');
        }

        const data = await response.json();
        console.log('Trades data received:', data);
        setIsLoading(false);
        return data;
      } catch (error) {
        console.error('Error fetching trades:', error);
        setIsLoading(false);
        return [];
      }
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    enabled: !!address,
    staleTime: 0,
    cacheTime: 0,
    onSuccess: () => {
      // Update timestamp on each successful fetch
      setTimestamp(Date.now());
    }
  });

  const refetch = async () => {
    setTimestamp(Date.now()); // Force new timestamp
    await queryClient.invalidateQueries(['trades', address]);
    return queryRefetch();
  };

  return { 
    trades: trades || [], 
    isLoading,
    refetch: async () => {
      await queryClient.invalidateQueries(['trades', address]);
      setTimestamp(Date.now());
    }
  };
}