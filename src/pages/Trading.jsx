import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';
import EnhancedDTFCard from '../components/EnhancedDTFCard';
import RecentTradesFeed from '../components/RecentTradesFeed';
import { TrendingUp, Users, Activity } from 'lucide-react';

function Trading() {
  const [dtfIds, setDtfIds] = useState([]);

  const { data: nextDtfId } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'nextDtfId'
  });

  useEffect(() => {
    if (nextDtfId) {
      const totalDtfs = Number(nextDtfId) - 1;
      if (totalDtfs > 0) {
        const existingIds = Array.from({ length: totalDtfs }, (_, i) => BigInt(i + 1));
        setDtfIds(existingIds);
      }
    }
  }, [nextDtfId]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced header with trading stats */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2"></h1>
            <div className="text-gray-400">Trade the future of prediction markets and AI</div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-gray-400 text-sm flex items-center justify-end gap-2">
                <Users size={14} />
                Active Traders
              </div>
              <div className="text-xl font-bold text-white">2.4k</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm flex items-center justify-end gap-2">
                <Activity size={14} />
                24h Volume
              </div>
              <div className="text-xl font-bold text-green-500">$124.5k</div>
            </div>
          </div>
        </div>

        {/* Market Trend Banner */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 rounded-full p-2">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div>
              <div className="text-green-500 font-semibold">Market Trend: Bullish</div>
              <div className="text-gray-400 text-sm">70% of EGOs trending upward</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">Most Active: EGO #23</div>
            <div className="text-gray-400 text-sm">$45.2k volume in last hour</div>
          </div>
        </div>

              {/* Recent Trades Feed */}
              <RecentTradesFeed />

        {/* DTF Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dtfIds.map((id) => (
            <EnhancedDTFCard key={id.toString()} dtfId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Trading;