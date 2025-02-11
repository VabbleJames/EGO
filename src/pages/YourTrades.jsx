import React, { useState } from 'react';
import { useWriteContract, useReadContracts, useAccount, usePublicClient } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import { useUserTrades } from '../hooks/useUserTrades';
import { formatUnits } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';

function YourTrades() {
  const { trades, isLoading, refetch } = useUserTrades();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [claimingDtfId, setClaimingDtfId] = useState(null);
  const [claimedTrades, setClaimedTrades] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  // Calculate total ROI
  const totalROI = React.useMemo(() => {
    if (!trades || !Array.isArray(trades)) return 0;
    
    return trades.reduce((total, trade) => {
      // Only include settled trades
      if (trade.status !== 'Settled') return total;
      
      // Parse ROI value from string (e.g., "+$5.00" or "-$3.50")
      const roiString = trade.roi.replace(/[^-\d.]/g, '');
      const roiValue = parseFloat(roiString);
      
      // Add to total (negative values will automatically subtract)
      return total + (isNaN(roiValue) ? 0 : roiValue);
    }, 0);
  }, [trades]);

  // Existing claim handling logic
  const handleClaim = async (dtfId) => {
    try {
      setClaimingDtfId(dtfId);
      
      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: [{
          "inputs": [{ "type": "uint256" }],
          "name": "claimWinnings",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'claimWinnings',
        args: [dtfId]
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      await fetch(
          `${API_URL}/api/v1/trades/${address}/claim/${dtfId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetch();
      
      setClaimedTrades(prev => new Set([...prev, dtfId]));
    } catch (error) {
      console.error('Error claiming:', error);
    } finally {
      setClaimingDtfId(null);
      setShowConfirmDialog(false);
    }
  };

  // Function to render status badge
  const StatusBadge = ({ status, position, trade }) => {
    if (status === 'Settled') {
      const isWinning = 
        (position === 'YES' && trade.dtf.yesWon) || 
        (position === 'NO' && !trade.dtf.yesWon);
      
      return (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
          ${isWinning ? 'bg-green-500/5 text-green-500' : 'bg-red-500/5 text-red-500'}`}>
          {isWinning ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {isWinning ? 'Won' : 'Loss'}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/5 text-blue-500 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Active
      </div>
    );
  };

  // Function to render ROI indicator
  const ROIIndicator = ({ roi }) => {
    const isPositive = roi.startsWith('+');
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{roi}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Your Shares</h1>
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-green-500/0 border-green-500/0 hover:bg-green-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-green-500">Winning Shares</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {trades?.filter(t => 
                    t.status === 'Settled' && 
                    ((t.position === 'YES' && t.dtf.yesWon) || 
                    (t.position === 'NO' && !t.dtf.yesWon))
                  ).length || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/0 border-red-500/0 hover:bg-red-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-red-500">Losing Shares</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {trades?.filter(t => 
                    t.status === 'Settled' && 
                    ((t.position === 'YES' && !t.dtf.yesWon) || 
                    (t.position === 'NO' && t.dtf.yesWon))
                  ).length || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/0 border-blue-500/0 hover:bg-blue-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-blue-500">Active Shares</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {trades?.filter(t => t.status !== 'Settled').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card className={`transition-all duration-200 ${totalROI >= 0 ? 
              'bg-green-500/0 border-green-500/0 hover:bg-green-500/0' : 
              'bg-red-500/5 border-red-500/0 hover:bg-red-500/0'}`}>
              <CardContent className="p-4">
                <div className={`text-sm ${totalROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  Total ROI
                </div>
                <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  {totalROI >= 0 ? 
                    <TrendingUp className="w-5 h-5 text-green-500" /> : 
                    <TrendingDown className="w-5 h-5 text-red-500" />}
                  ${Math.abs(totalROI).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : trades && trades.length > 0 ? (
          <div className="grid gap-4">
            {trades.map((trade, index) => (
              <Card key={`${trade.dtfId}-${trade.position}-${trade.shares}`} 
                    className="bg-black/100 border-white/20 hover:border-white/50 hover:bg-black/100 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="text-lg font-semibold text-white">{trade.dtfName}</div>
                        <div className="text-sm text-gray-400">
                          Position: <span className={trade.position === 'YES' ? 'text-green-500' : 'text-red-500'}>
                            {trade.position}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={trade.status} position={trade.position} trade={trade} />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-8 mt-4">
                    <div>
                      <div className="text-sm text-gray-400">Shares</div>
                      <div className="text-lg font-medium text-white">{trade.shares}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Average Entry</div>
                      <div className="text-lg font-medium text-white">{trade.averageEntryPrice}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">ROI</div>
                      <div className="text-lg font-medium">
                        <ROIIndicator roi={trade.roi} />
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      {trade.status === 'Settled' && (
                        (trade.position === 'YES' && trade.dtf.yesWon) ||
                        (trade.position === 'NO' && !trade.dtf.yesWon) ? (
                          trade.claimed ? (
                            <span className="text-green-500 font-medium">Claimed</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedTrade(trade);
                                setShowConfirmDialog(true);
                              }}
                              disabled={claimingDtfId === trade.dtfId || claimedTrades.has(trade.dtfId)}
                              className={`px-6 py-2 rounded-lg ${
                                claimingDtfId === trade.dtfId || claimedTrades.has(trade.dtfId)
                                  ? 'bg-gray-500/50 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white font-medium transition-colors`}
                            >
                              {claimingDtfId === trade.dtfId ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Claiming...
                                </div>
                              ) : 'Claim'}
                            </button>
                          )
                        ) : null
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-black/30 border-white/5">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-400">No Shares found</div>
              <p className="text-gray-500 mt-2">Start trading to see your shares here</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-black/80 border-white/5">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Confirm Claim</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to claim your winnings for {selectedTrade?.dtfName}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClaim(selectedTrade?.dtfId)}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default YourTrades;