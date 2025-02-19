import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { erc20Abi } from 'viem';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';

function BuySharesModal({ dtf, isOpen, onClose, dtfId }) {
  const { address } = useAccount();
  const balances = useTokenBalances(address);
  const [shareAmount, setShareAmount] = useState('');
  const [isYes, setIsYes] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient();

  // Get pool info (liquidity)
  const { data: poolInfo } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getDTFPoolInfo',
    args: [dtfId],
    enabled: Boolean(dtf)
  });

  // Get share prices
  const { data: sharePrices } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getSharePrices',
    args: [dtfId],
    enabled: Boolean(dtf)
  });

  // Get total shares for YES and NO sides
  const { data: yesTokenSupply } = useReadContract({
    address: dtf?.[7], // yesToken address
    abi: erc20Abi,
    functionName: 'totalSupply',
    enabled: Boolean(dtf && dtf[7])
  });

  const { data: noTokenSupply } = useReadContract({
    address: dtf?.[8], // noToken address
    abi: erc20Abi,
    functionName: 'totalSupply',
    enabled: Boolean(dtf && dtf[8])
  });

  console.log('DTF:', dtf)

  // Calculate base cost of shares
  const calculateUSDCCost = useCallback((shares) => {
    if (!shares || !sharePrices) return 0;

    console.log('=== Cost Calculation ===');
    console.log('Share Prices:', sharePrices);
    console.log('Shares:', shares);
    console.log('Is Yes Position:', isYes);

    const price = isYes ? Number(sharePrices[0]) : Number(sharePrices[1]);
    const cost = Number(shares) * (price / 1e6);

    console.log('Price per share:', price / 1e6);
    console.log('Total Cost:', cost);
    return cost;
  }, [sharePrices, isYes]);

  // Calculate fees (2.5%)
  const calculateFees = useCallback((shares) => {
    const cost = calculateUSDCCost(shares);
    return cost * 0.025;
  }, [calculateUSDCCost]);

  // Calculate potential payout
  const calculatePotentialPayout = useCallback(() => {
    if (!poolInfo || !shareAmount) return 0;
    
    console.log('=== Potential Payout Calculation ===');
    console.log('Pool Info:', poolInfo);
    console.log('Raw Yes Token Supply:', yesTokenSupply);
    console.log('Raw No Token Supply:', noTokenSupply);

    // Guard against undefined token supplies
    if (yesTokenSupply === undefined || noTokenSupply === undefined) {
        console.log('Token supplies not loaded yet');
        return 0;
    }

    // Get existing shares for the relevant side
    const existingShares = isYes ? 
      Number(formatUnits(yesTokenSupply, 18)) : 
      Number(formatUnits(noTokenSupply, 18));

    // Get current pool size (in USDC)
    const currentPool = (Number(poolInfo[0]) + Number(poolInfo[1])) / 1e6;
    const cost = calculateUSDCCost(shareAmount);
    const netAmount = cost * 0.975; // Remove 2.5% fees
    const userShares = Number(shareAmount);

    console.log('Existing Shares:', existingShares);
    console.log('Current Pool Size:', currentPool);
    console.log('User Shares:', userShares);
    console.log('Net Amount (after fees):', netAmount);

    // Special case: First buyer on this side
    if (existingShares === 0) {
      const payout = currentPool + netAmount;
      console.log('First Buyer Case - Payout:', payout);
      return payout;
    }

    // Regular case: Calculate based on share ratio
    const totalShares = existingShares + userShares;
    const shareRatio = userShares / totalShares;
    const totalPool = currentPool + netAmount;
    const payout = shareRatio * totalPool;
    
    console.log('Regular Case:');
    console.log('Total Shares:', totalShares);
    console.log('Share Ratio:', shareRatio);
    console.log('Total Pool:', totalPool);
    console.log('Payout:', payout);
    
    return payout;
}, [poolInfo, shareAmount, yesTokenSupply, noTokenSupply, isYes, calculateUSDCCost]);

  // Calculate estimated profit
  const calculateEstimatedProfit = useCallback(() => {
    if (!shareAmount || !poolInfo) return 0;

    console.log('=== Profit Calculation ===');
    const cost = calculateUSDCCost(shareAmount);
    console.log('Cost:', cost);
    const potentialPayout = calculatePotentialPayout();
    console.log('Potential Payout:', potentialPayout);
    const profit = potentialPayout - cost;
    console.log('Estimated Profit:', profit);

    return profit;
  }, [shareAmount, calculateUSDCCost, calculatePotentialPayout, poolInfo]);

  // Calculate price impact
  const calculatePriceImpact = useCallback((shares) => {
    if (!poolInfo || !shares) return 0;
    const totalPool = (Number(poolInfo[0]) + Number(poolInfo[1])) / 1e6;
    if (totalPool === 0) return 0;
    const cost = calculateUSDCCost(shares);
    return (cost / totalPool) * 100;
  }, [poolInfo, calculateUSDCCost]);

  // Allowance checking
  const checkAllowance = useCallback(async () => {
    if (!address || !calculateUSDCCost(shareAmount)) return false;
    try {
      const allowance = await client.readContract({
        address: SEPOLIA_CONTRACTS.TOKENS.USDC,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, SEPOLIA_CONTRACTS.DTF_MARKET]
      });
      const amountToApprove = parseUnits(calculateUSDCCost(shareAmount).toString(), 6);
      return allowance >= amountToApprove;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [address, client, calculateUSDCCost, shareAmount]);

  useEffect(() => {
    const checkCurrentAllowance = async () => {
      if (!address || !calculateUSDCCost(shareAmount)) return;
      const isApproved = await checkAllowance();
      setHasAllowance(isApproved);
    };

    checkCurrentAllowance();
  }, [address, calculateUSDCCost, shareAmount, checkAllowance]);

  const handleApprove = async () => {
    if (!calculateUSDCCost(shareAmount)) return;

    try {
      setIsApproving(true);
      const amountToApprove = parseUnits(calculateUSDCCost(shareAmount).toString(), 6);

      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.TOKENS.USDC,
        abi: erc20Abi,
        functionName: 'approve',
        args: [SEPOLIA_CONTRACTS.DTF_MARKET, amountToApprove]
      });

      await client.waitForTransactionReceipt({ hash });
      const isApproved = await checkAllowance();
      setHasAllowance(isApproved);

    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleBuy = async () => {
    if (!shareAmount || isBuying || !hasAllowance) return;

    try {
      setIsBuying(true);
      const shareAmountBigInt = parseUnits(shareAmount, 18);

      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'buyShares',
        args: [dtfId, isYes, shareAmountBigInt]
      });

      await client.waitForTransactionReceipt({ hash });
      onClose();

    } catch (error) {
      console.error('Error buying shares:', error);
    } finally {
      setIsBuying(false);
    }
  };

  // Get current shares for display
  const currentYesShares = yesTokenSupply ? Number(formatUnits(yesTokenSupply, 18)) : 0;
  const currentNoShares = noTokenSupply ? Number(formatUnits(noTokenSupply, 18)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          Purchase {dtf?.[1]} Shares
        </h2>

        {/* YES/NO Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsYes(true)}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg ${isYes ? 'bg-[#22C55E] text-white' : 'bg-[#1E1E1E] text-gray-400'
              }`}
          >
            YES (${sharePrices ? (Number(sharePrices[0]) / 1e6).toFixed(2) : '0.00'})
            <div className="text-sm mt-1 opacity-75">
            </div>
          </button>
          <button
            onClick={() => setIsYes(false)}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg ${!isYes ? 'bg-red-500 text-white' : 'bg-[#1E1E1E] text-gray-400'
              }`}
          >
            NO (${sharePrices ? (Number(sharePrices[1]) / 1e6).toFixed(2) : '0.00'})
            <div className="text-sm mt-1 opacity-75">
            </div>
          </button>
        </div>

        {/* Share Amount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Share Amount</label>
          <input
            type="number"
            value={shareAmount}
            onChange={(e) => setShareAmount(e.target.value)}
            className="w-full px-4 py-4 bg-[#1E1E1E] rounded-xl text-white text-lg"
            placeholder="0"
          />
          <div className="text-right text-gray-400 mt-2">
            Your Balance: ${formatUnits(balances?.USDC || 0n, 6)} USDC
          </div>
        </div>

        {/* Calculations */}
        <div className="space-y-3 text-gray-400">
          <div className="flex justify-between">
            <span>Cost:</span>
            <span className="text-white">
              ${calculateUSDCCost(shareAmount).toFixed(2)} USDC
            </span>
          </div>

          <div className="flex justify-between">
            <span>Fees @ 2.5%:</span>
            <span className="text-white">
              ${calculateFees(shareAmount).toFixed(2)} USDC
            </span>
          </div>

          {/*<div className="flex justify-between">
            <span>Price Impact:</span>
            <span className={`${
              calculatePriceImpact(shareAmount) > 5 ? 'text-red-500' : 'text-white'
            }`}>
              {calculatePriceImpact(shareAmount).toFixed(2)}%
            </span>
          </div> */}

          {/* <div className="flex justify-between">
            <span>Share Ratio:</span>
            <span className="text-white">
              {shareAmount && (isYes ? currentYesShares : currentNoShares) ? (
                (Number(shareAmount) / (Number(shareAmount) + (isYes ? currentYesShares : currentNoShares)) * 100).toFixed(2)
              ) : '0.00'}%
            </span>
          </div> */}

          <div className="flex justify-between">
            <span>Potential Payout:</span>
            <span className="text-white">
              ${calculatePotentialPayout().toFixed(2)} USDC
            </span>
          </div>

          {/* <div className="flex justify-between">
            <span>Estimated Profit:</span>
            <span className={calculateEstimatedProfit() > 0 ? 'text-[#22C55E]' : 'text-red-500'}>
              {calculateEstimatedProfit() > 0 ? '+' : ''}${calculateEstimatedProfit().toFixed(2)} USDC
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payout Rate:</span>
            <span className="text-white">$1 = 1 share</span>
          </div> */}
        </div>

        {/* Action Button */}
        {!hasAllowance ? (
          <button
            onClick={handleApprove}
            disabled={isApproving || !shareAmount}
            className={`w-full mt-6 py-4 rounded-xl text-white font-semibold text-lg ${isApproving || !shareAmount
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#22C55E] hover:bg-[#16A34A]'
              }`}
          >
            {isApproving ? 'Approving...' : 'Approve USDC'}
          </button>
        ) : (
          <button
            onClick={handleBuy}
            disabled={!shareAmount || isBuying}
            className={`w-full mt-6 py-4 rounded-xl text-white font-semibold text-lg ${!shareAmount || isBuying
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#22C55E] hover:bg-[#16A34A]'
              }`}
          >
            {isBuying ? 'Buying...' : 'Buy Shares'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BuySharesModal;