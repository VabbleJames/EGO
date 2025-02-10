import React, { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';
import DTFPriceOracle from '../contracts/abis/DTFPriceOracle.json';
import { formatUnits } from 'viem';
import { LineChart, Line, YAxis } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Users } from 'lucide-react';
import BuySharesModal from './BuySharesModal';

function EnhancedDTFCard({ dtfId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Match the exact same contract calls as original
  const { data: dtf, isError, isLoading } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: [{
      "inputs": [{ "type": "uint256" }],
      "name": "dtfs",
      "outputs": [
        { "type": "address" },
        { "type": "string" },
        { "type": "uint256" },
        { "type": "uint256" },
        { "type": "bool" },
        { "type": "bool" },
        { "type": "bool" },
        { "type": "address" },
        { "type": "address" },
        { "type": "uint256" },
        { "type": "uint256" },
        { "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'dtfs',
    args: [dtfId]
  });

  const { writeContractAsync } = useWriteContract();

  const { data: poolInfo } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getDTFPoolInfo',
    args: [dtfId]
  });

  const { data: lockedTokensData } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getDTFLockedTokens',
    args: [dtfId]
  });

  const { data: calculatedValuation } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_PRICE_ORACLE,
    abi: DTFPriceOracle,
    functionName: 'calculateValuation',
    args: lockedTokensData ? [lockedTokensData[0], lockedTokensData[1]] : undefined,
    enabled: Boolean(lockedTokensData)
  });

  const { data: sharePrices } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getSharePrices',
    args: [dtfId],
    enabled: Boolean(dtf)
  });

  const getTokenSymbol = (address) => {
    const symbolEntry = Object.entries(SEPOLIA_CONTRACTS.TOKENS)
      .find(([_, addr]) => addr.toLowerCase() === address.toLowerCase());
    return symbolEntry ? symbolEntry[0] : address.slice(0, 6) + '...' + address.slice(-4);
  };

  if (isLoading || !dtf) {
    return (
      <div className="bg-card-dark rounded-lg p-4 border border-card-border animate-pulse">
        <div className="h-4 bg-progress-bg rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-progress-bg rounded w-1/2"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card-dark rounded-lg p-4 border border-red-500">
        <div className="text-red-500">Error loading DTF data</div>
      </div>
    );
  }

  const isExpired = Number(dtf[2]) < Math.floor(Date.now() / 1000);

  const handleSettle = async () => {
    try {
      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'settleDTF',
        args: [dtfId]
      });
      console.log('Settlement transaction hash:', hash);
    } catch (error) {
      console.error('Error settling DTF:', error);
    }
  };

  const timeLeft = Number(dtf[2]) * 1000 - Date.now();
  const currentVal = calculatedValuation ? Number(formatUnits(calculatedValuation, 18)) : 0;
  const targetVal = Number(formatUnits(dtf[3], 18));
  const progressToTarget = Math.min(
    Math.abs((currentVal / targetVal - 1) * 100),
    100
  );

  return (
    <div className="bg-[#000000] rounded-xl p-6 border border-white/20 hover:border-white/50">

      {/* Header with live price indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <img src="https://i.postimg.cc/KzJqMWPt/PNG-LOGO.png" alt="DTF Icon" className="w-12 h-1" />
          <h3 className="text-xl font-bold">{dtf[1]}</h3>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
          dtf[5] ? 'bg-green-500' : 
          isExpired ? 'bg-red-500' : 
          'bg-[#2563EB]'
        }`}>
          {dtf[5] ? 'Settled' : isExpired ? 'Expired' : 'Active'}
        </span>
      </div>

      {/* Volume */}
      <div className="mb-4">
        <span className="text-gray-400">Vol: </span>
        <span className="text-[#22C55E]">
          {poolInfo ? ((Number(poolInfo[2]) - (50 * (10 ** 6))) / (10 ** 6)).toFixed(2) : 'Loading...'} USDC
        </span>
      </div>

      {/* Tokens */}
      <div className="flex gap-4 mb-4">
        {lockedTokensData && lockedTokensData[0].map((token, index) => (
          <div key={index} className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm">
              {formatUnits(lockedTokensData[1][index], 18)} {getTokenSymbol(token)}
            </span>
          </div>
        ))}
      </div>

      {/* Progress and Values */}
      <div className="space-y-4 mb-4">
        {/* Time remaining */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock size={14} />
              Time Remaining
            </span>
            <span className="text-white">
              {Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))}h {Math.max(0, Math.floor((timeLeft / (1000 * 60)) % 60))}m
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all"
              style={{ width: `${Math.max(0, (timeLeft / (24 * 60 * 60 * 1000)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Progress to target 
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400 flex items-center gap-1">
              <TrendingUp size={14} />
              Progress to Target
            </span>
            <span className="text-white">{progressToTarget.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2 transition-all"
              style={{ width: `${progressToTarget}%` }}
            />
          </div> 
        </div> */}
      </div> 

      {/* Values */}
      <div className="space-y-1 mb-4">
        <div>
          <span className="text-gray-400">Real Time Value: </span>
          <span className="text-white">
            ${calculatedValuation ? Number(formatUnits(calculatedValuation, 18)).toFixed(2) : 'Loading...'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Target Value: </span>
          <span className="text-white">
            ${Number(formatUnits(dtf[3], 18)).toFixed(2)} {dtf[4] ? 'or higher' : 'or lower'}
          </span>
        </div>
      </div>

      {/* Price Bars */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Yes</span>
            <span>${sharePrices ? Number(sharePrices[0]) / (10 ** 6) : 'Loading...'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2"
              style={{ width: `${sharePrices ? (Number(sharePrices[0]) / (10 ** 6) * 100) : 0}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>No</span>
            <span>${sharePrices ? Number(sharePrices[1]) / (10 ** 6) : 'Loading...'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-red-500 rounded-full h-2"
              style={{ width: `${sharePrices ? (Number(sharePrices[1]) / (10 ** 6) * 100) : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Buy/Settle Button */}
      {dtf[5] ? (
        <button
          disabled
          className="w-full py-3 bg-gray-600 rounded-lg transition-colors cursor-not-allowed text-gray-300"
        >
          DTF Settled
        </button>
      ) : isExpired ? (
        <button
          onClick={handleSettle}
          className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          Settle DTF
        </button>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] rounded-lg transition-colors"
        >
          Buy Shares
        </button>
      )}

      {/* Buy Shares Modal */}
      <BuySharesModal
        dtf={dtf}
        dtfId={dtfId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default EnhancedDTFCard;