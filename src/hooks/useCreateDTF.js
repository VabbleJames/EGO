import { useState, useCallback } from 'react';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { erc20Abi } from 'viem';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';

const TOKEN_CONFIG = {
  USDC: { decimals: 6 },
  LINK: { decimals: 18 },
  AAVE: { decimals: 18 }
};

export const useCreateDTF = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient();
  
  const [status, setStatus] = useState({
    stage: 'idle',
    error: null,
    transactions: []
  });

  const checkAllowance = async (tokenAddress, amount) => {
    try {
      const allowance = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, SEPOLIA_CONTRACTS.DTF_MARKET]
      });
      return allowance >= amount;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  };

  const approveToken = async (tokenAddress, amount) => {
    const tx = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [SEPOLIA_CONTRACTS.DTF_MARKET, amount]
    });
    return await client.waitForTransactionReceipt({ hash: tx });
  };

  const createDTF = useCallback(async (formData) => {
    try {
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      setStatus({ stage: 'checking', error: null, transactions: [] });

      // Check USDC bond allowance first
      const BOND_AMOUNT = 50_000_000n; // 50 USDC (6 decimals)
      const hasUSDCAllowance = await checkAllowance(SEPOLIA_CONTRACTS.TOKENS.USDC, BOND_AMOUNT);

      // Get token amounts for checking
      const validTokens = formData.tokens.filter(t => t.address && t.amount);
      const tokenAmounts = validTokens.map(t => ({
        address: t.address,
        amount: parseUnits(t.amount, getTokenDecimals(t.address))
      }));

      // Check token allowances
      const allowanceChecks = await Promise.all([
        // Include USDC bond check
        { address: SEPOLIA_CONTRACTS.TOKENS.USDC, amount: BOND_AMOUNT, hasAllowance: hasUSDCAllowance },
        // Check all other tokens
        ...tokenAmounts.map(async (token) => ({
          address: token.address,
          amount: token.amount,
          hasAllowance: await checkAllowance(token.address, token.amount)
        }))
      ]);

      // If any token needs approval, send approval transaction
      const needsApproval = allowanceChecks.filter(check => !check.hasAllowance);
      if (needsApproval.length > 0) {
        setStatus(prev => ({ ...prev, stage: 'approving' }));
        for (const token of needsApproval) {
          const receipt = await approveToken(token.address, token.amount);
          setStatus(prev => ({
            ...prev,
            transactions: [...prev.transactions, { hash: receipt.transactionHash, type: 'approval' }]
          }));
        }
      }

      // Create DTF
      setStatus(prev => ({ ...prev, stage: 'creating' }));
      
      const tx = await writeContractAsync({
        address: SEPOLIA_CONTRACTS.DTF_MARKET,
        abi: DTFMarket,
        functionName: 'createDTF',
        args: [
          formData.name,
          validTokens.map(t => t.address),
          validTokens.map(t => parseUnits(t.amount, getTokenDecimals(t.address))),
          BigInt(Math.floor(new Date(formData.expiryTime).getTime() / 1000)),
          parseUnits(formData.targetValuation, 18),
          formData.isTargetHigher
        ]
      });

      setStatus(prev => ({ 
        ...prev, 
        stage: 'pending',
        transactions: [...prev.transactions, { hash: tx, type: 'create' }]
      }));

      const receipt = await client.waitForTransactionReceipt({ hash: tx });
      
      setStatus({
        stage: 'complete',
        error: null,
        transactions: [
          ...status.transactions,
          { hash: tx, type: 'create', receipt }
        ]
      });

      return receipt;
    } catch (error) {
      console.error("DTF Creation error:", error);
      setStatus({
        stage: 'error',
        error: error.message || 'Failed to create DTF',
        transactions: []
      });
      throw error;
    }
  }, [isConnected, address, writeContractAsync, client]);

  return {
    createDTF,
    status,
    isConnected
  };
};

function getTokenDecimals(tokenAddress) {
  const symbolEntry = Object.entries(SEPOLIA_CONTRACTS.TOKENS)
    .find(([_, addr]) => addr.toLowerCase() === tokenAddress.toLowerCase());
  return symbolEntry ? TOKEN_CONFIG[symbolEntry[0]].decimals : 18;
}