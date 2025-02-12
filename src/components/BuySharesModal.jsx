import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { erc20Abi } from 'viem';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';

function BuySharesModal({ dtf, isOpen, onClose, dtfId }) {
  // 1. Hooks and state declarations
  const { address } = useAccount();
  const  balances  = useTokenBalances(address);
  const [shareAmount, setShareAmount] = useState('');
  const [isYes, setIsYes] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient();
  const isLoading = isApproving || isBuying;

  // 2. Contract read hooks
  const { data: sharePrices } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'getSharePrices',
    args: [dtfId],
    enabled: Boolean(dtf)
  });

  // 3. Helper functions
  const calculateUSDCCost = (shares) => {
    if (!shares || !sharePrices) return 0;
    const price = isYes ? sharePrices[0] : sharePrices[1];
    if (!price) return 0;
    return (Number(shares) * (Number(price) / (10 ** 6)));
  };

  const usdcCost = calculateUSDCCost(shareAmount);

  // 4. Define checkAllowance function
  const checkAllowance = useCallback(async () => {
    try {
      const allowance = await client.readContract({
        address: SEPOLIA_CONTRACTS.TOKENS.USDC,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, SEPOLIA_CONTRACTS.DTF_MARKET]
      });
      const amountToApprove = parseUnits(usdcCost.toString(), 6);
      return allowance >= amountToApprove;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [address, client, usdcCost]);

  // 5. useEffect with checkAllowance
  useEffect(() => {
    const checkCurrentAllowance = async () => {
      if (!address || !usdcCost) return;
      const isApproved = await checkAllowance();
      setHasAllowance(isApproved);
    };

    checkCurrentAllowance();
  }, [address, usdcCost, checkAllowance]);

  const calculateFees = () => {
    return usdcCost * 0.025; // 2.5% of USDC cost
  };

  const calculatePotentialPayout = () => {
    return shareAmount ? Number(shareAmount) : 0; // $1 per share
  };

  const calculateEstimatedProfit = () => {
    const fees = calculateFees();
    const payout = calculatePotentialPayout();
    return payout - (usdcCost + fees);
  };

  // 6. Action handlers
  const handleApprove = async () => {
    if (!usdcCost) return;

    try {
      setIsApproving(true);
      const amountToApprove = parseUnits(usdcCost.toString(), 6);

      const hash = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.TOKENS.USDC,
        abi: erc20Abi,
        functionName: 'approve',
        args: [SEPOLIA_CONTRACTS.DTF_MARKET, amountToApprove]
      });

      const receipt = await client.waitForTransactionReceipt({ hash });
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
        args: [
          dtfId,          
          isYes,          
          shareAmountBigInt  
        ]
      });
  
      await client.waitForTransactionReceipt({ hash });
      
      // Pass both success and purchase type back to parent
      onClose(true, isYes);
  
    } catch (error) {
      console.error('Error buying shares:', error);
      onClose(false, false);
    } finally {
      setIsBuying(false);
    }
  };

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
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg ${isYes
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#1E1E1E] text-gray-400'
              }`}
          >
            YES (${sharePrices ? Number(sharePrices[0]) / (10 ** 6) : '0.00'})
          </button>
          <button
            onClick={() => setIsYes(false)}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg ${!isYes
                ? 'bg-red-500 text-white'
                : 'bg-[#1E1E1E] text-gray-400'
              }`}
          >
            NO (${sharePrices ? Number(sharePrices[1]) / (10 ** 6) : '0.00'})
          </button>
        </div>

        {/* Share Amount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">
            Share Amount
          </label>
          <input
            type="number"
            value={shareAmount}
            onChange={(e) => setShareAmount(e.target.value)}
            className="w-full px-4 py-4 bg-[#1E1E1E] rounded-xl text-white text-lg"
            placeholder="0"
          />
          <div className="text-right text-gray-400 mt-2">
          Your Balance: ${balances?.USDC ? formatUnits(balances.USDC, 6) : '0.00'} USDC
          </div>
        </div>

        {/* Calculations */}
        <div className="space-y-3 text-gray-400">
          <div className="flex justify-between">
            <span>Cost incl fees:</span>
            <span className="text-white">${usdcCost.toFixed(2)} USDC</span>
          </div>

          <div className="flex justify-between">
            <span>Fees @ 2.5%:</span>
            <span className="text-white">${calculateFees().toFixed(2)}c</span>
          </div>

          <div className="flex justify-between">
            <span>Potential Payout:</span>
            <span className="text-white">${calculatePotentialPayout()} USDC</span>
          </div>

          <div className="flex justify-between">
            <span>Estimate Profit:</span>
            <span className={calculateEstimatedProfit() > 0 ? 'text-[#22C55E]' : 'text-red-500'}>
              {calculateEstimatedProfit() > 0 ? '+' : ''}${calculateEstimatedProfit().toFixed(2)} USDC
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payout Rate:</span>
            <span className="text-white">$1 = 1 share</span>
          </div>
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