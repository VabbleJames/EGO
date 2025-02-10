import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Timer, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  Lock,
  Unlock
} from 'lucide-react';

function DTFCreatorCard({ dtfId, address }) {
  const { writeContractAsync } = useWriteContract();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalComplete, setWithdrawalComplete] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const getTokenSymbol = (address) => {
    const symbolEntry = Object.entries(SEPOLIA_CONTRACTS.TOKENS)
      .find(([_, addr]) => addr.toLowerCase() === address.toLowerCase());
    return symbolEntry ? symbolEntry[0] : address.slice(0, 6) + '...' + address.slice(-4);
  };

  // Contract reads (keeping existing functionality)
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

  const { data: lockedTokensData } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getDTFLockedTokens',
    args: [dtfId],
    enabled: Boolean(dtf)
  });

  const { data: feeData } = useQuery({
    queryKey: ['dtf-fees', dtfId.toString()],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/v1/dtfs/${dtfId.toString()}/fees`);
      if (!response.ok) throw new Error('Failed to fetch fee data');
      return response.json();
    },
    refetchInterval: 3000
  });

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      setShowWithdrawConfirm(false);

      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'withdrawTokens',
        args: [dtfId]
      });

      console.log('Withdrawal transaction hash:', hash);
      setWithdrawalComplete(true);
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) return null;
  if (!dtf) return null;

  const isCreator = dtf[0].toLowerCase() === address.toLowerCase();
  if (!isCreator) return null;

  const isExpired = Number(dtf[2]) < Math.floor(Date.now() / 1000);
  const timeRemaining = Math.max(0, Number(dtf[2]) - Math.floor(Date.now() / 1000));
  const days = Math.floor(timeRemaining / (24 * 60 * 60));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);

  return (
    <>
      <Card className="bg-black/100 border-white/20 hover:border-white/50 hover:bg-black/100 transition-all duration-200">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{dtf[1]}</h3>
                <div className="text-sm text-gray-400">DTF #{dtfId.toString()}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
              ${dtf[5] ? 'bg-green-500/10 text-green-500' : 
                isExpired ? 'bg-red-500/10 text-red-500' : 
                'bg-blue-500/10 text-blue-500'}`}>
              {dtf[5] ? <CheckCircle className="w-4 h-4" /> :
                isExpired ? <AlertCircle className="w-4 h-4" /> :
                <Timer className="w-4 h-4" />}
              {dtf[5] ? 'Settled' : isExpired ? 'Expired' : 'Active'}
            </div>
          </div>

          {/* Fee Stats Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-2">Creator Fees Earned</div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-xl font-bold text-green-500">
                  {feeData?.creatorFees.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'}
                </span>
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-2">Total Volume</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-xl font-bold text-white">
                  ${feeData?.totalVolume.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Target Valuation</div>
                  <div className="text-lg font-semibold text-white mt-1">
                    ${formatUnits(dtf[3], 18)}
                    <span className="text-gray-400 text-sm ml-1">
                      {dtf[4] ? 'or higher' : 'or lower'}
                    </span>
                  </div>
                </div>
                {dtf[4] ? 
                  <TrendingUp className="w-5 h-5 text-green-500" /> : 
                  <TrendingDown className="w-5 h-5 text-red-500" />}
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Time {dtf[5] ? 'Ended' : 'Remaining'}</div>
                  <div className="text-lg font-semibold text-white mt-1">
                    {dtf[5] ? 
                      new Date(Number(dtf[2]) * 1000).toLocaleString() :
                      isExpired ? 'Expired' :
                      `${days}d ${hours}h ${minutes}m`}
                  </div>
                </div>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Locked Tokens */}
          {lockedTokensData && (
            <div className="bg-black/20 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-400 mb-3">Locked Tokens</div>
              <div className="grid grid-cols-2 gap-4">
                {lockedTokensData[0].map((token, index) => (
                  <div key={index} className="flex items-center bg-black/20 rounded-lg p-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-white text-sm">
                      {formatUnits(lockedTokensData[1][index], 18)} {getTokenSymbol(token)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Section */}
          {dtf[5] && (
            <div className="mt-4">
              {dtf[6] ? (
                <div className="flex items-center justify-center gap-2 text-green-500 bg-green-500/5 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Withdrawal complete</span>
                </div>
              ) : (
                <button 
                  onClick={() => setShowWithdrawConfirm(true)}
                  disabled={isWithdrawing}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2
                    ${isWithdrawing 
                      ? 'bg-gray-500/50 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                    } text-white font-medium transition-colors`}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      Withdraw Tokens
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={showWithdrawConfirm} onOpenChange={setShowWithdrawConfirm}>
        <DialogContent className="bg-black/80 border-white/5">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Confirm Withdrawal</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to withdraw your locked tokens from {dtf[1]}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function YourDTFs() {
  const [dtfIds, setDtfIds] = useState([]);
  const { address, isConnected } = useAccount();

  // Get total number of DTFs
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

  // Stats tracking at the parent level
  const [totals, setTotals] = useState({
    totalFees: 0,
    totalVolume: 0,
    totalDTFs: 0
  });

  const updateTotals = async () => {
    let fees = 0;
    let volume = 0;

    try {
      // Fetch data for all DTFs in parallel
      const results = await Promise.all(
        dtfIds.map(id => 
          fetch(`http://localhost:3001/api/v1/dtfs/${id.toString()}/fees`)
            .then(res => res.json())
            .catch(() => ({ creatorFees: 0, totalVolume: 0 }))
        )
      );

      // Sum up the results
      results.forEach(data => {
        fees += Number(data.creatorFees) || 0;
        volume += Number(data.totalVolume) || 0;
      });

      setTotals({
        totalFees: fees,
        totalVolume: volume,
        totalDTFs: dtfIds.length
      });
    } catch (error) {
      console.error('Error updating totals:', error);
    }
  };

  // Update totals whenever dtfIds changes or every 3 seconds
  useEffect(() => {
    updateTotals();
    const interval = setInterval(updateTotals, 3000);
    return () => clearInterval(interval);
  }, [dtfIds]);

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
        {/* Stats Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Your DTFs</h1>
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-500/0 border-green-500/0 hover:bg-green-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-green-500">Total Fees Earned</div>
                <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  ${totals.totalFees.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/0 border-blue-500/0 hover:bg-blue-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-blue-500">Total Volume</div>
                <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  ${totals.totalVolume.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/0 border-purple-500/0 hover:bg-purple-500/0 transition-all duration-200">
              <CardContent className="p-4">
                <div className="text-sm text-purple-500">Created DTFs</div>
                <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  {totals.totalDTFs}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* DTF Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dtfIds.map((id) => (
            <DTFCreatorCard key={id.toString()} dtfId={id} address={address} />
          ))}
        </div>

        {/* Empty State */}
        {dtfIds.length === 0 && (
          <Card className="bg-black/30 border-white/5">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <Lock className="w-12 h-12 text-gray-500 mb-4" />
              <div className="text-xl font-medium text-gray-400">No DTFs Created</div>
              <p className="text-gray-500 mt-2">Create your first DTF to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default YourDTFs;