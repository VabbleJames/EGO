import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { useCreateDTF } from '../hooks/useCreateDTF';
import { useReadContract } from 'wagmi';
import DTFPriceOracleABI from '../contracts/abis/DTFPriceOracle.json';


// Token configuration specifying decimals for each supported token
const TOKEN_CONFIG = {
  USDC: { decimals: 6, symbol: 'USDC' },
  LINK: { decimals: 18, symbol: 'LINK' },
  AAVE: { decimals: 18, symbol: 'AAVE' }
};

function CreateDTF() {
  const { address } = useAccount();
  const balances = useTokenBalances(address);
  const { createDTF, status, isConnected } = useCreateDTF();
  const [isProcessing, setIsProcessing] = useState(false);

  // Main form data state
  const [formData, setFormData] = useState({
    name: '',
    expiryTime: '',
    targetValuation: '',
    isTargetHigher: true,
    tokens: [{ address: '', amount: '' }]  // Initial empty token entry
  });

  // State for form validation errors
  const [fieldErrors, setFieldErrors] = useState({
    tokenAmounts: {},
    expiryTime: '',
    targetValuation: ''
  });

  // State for tracking the current total valuation of selected tokens
  const [currentValuation, setCurrentValuation] = useState(0);

  const getTokenDecimals = (tokenAddress) => {
    const symbolEntry = Object.entries(SEPOLIA_CONTRACTS.TOKENS)
      .find(([_, addr]) => addr.toLowerCase() === tokenAddress.toLowerCase());
    return symbolEntry ? TOKEN_CONFIG[symbolEntry[0]].decimals : 18;
  };

  const { data: calculatedValuation } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_PRICE_ORACLE,
    abi: DTFPriceOracleABI,
    functionName: 'calculateValuation',
    args: [
      formData.tokens.map(t => t.address).filter(Boolean),
      formData.tokens.map(t => t.amount ? parseUnits(t.amount, getTokenDecimals(t.address)) : 0n).filter(Boolean)
    ],
    enabled: formData.tokens.some(t => t.address && t.amount),
  });

  useEffect(() => {
    if (calculatedValuation) {
      const value = Number(formatUnits(calculatedValuation, 18));
      setCurrentValuation(value);
    }
  }, [calculatedValuation]);

  // Utility function to get a token's symbol from its address
  const getTokenSymbol = (address) => {
    if (!address) return null;
    const entry = Object.entries(SEPOLIA_CONTRACTS.TOKENS)
      .find(([_, addr]) => addr.toLowerCase() === address.toLowerCase());
    return entry ? entry[0] : null;
  };

  // Function to parse token amounts considering their decimals
  const parseTokenAmount = (amount, tokenAddress) => {
    const symbol = getTokenSymbol(tokenAddress);
    if (!symbol) return 0n;
    try {
      return parseUnits((amount || '0').toString(), TOKEN_CONFIG[symbol].decimals);
    } catch (error) {
      console.error('Error parsing amount:', error);
      return 0n;
    }
  };

  // Function to get and format token balances
  const getTokenBalance = (tokenAddress) => {
    if (!tokenAddress || !balances) return '0';

    try {
      const symbol = getTokenSymbol(tokenAddress);
      if (!symbol) return '0';

      // Safely access balance using the new structure
      const balance = balances[symbol];
      if (!balance) return '0';

      const decimals = TOKEN_CONFIG[symbol].decimals;
      const formatted = formatUnits(balance, decimals);

      // Debug log
      console.log('Token balance check:', {
        symbol,
        balance,
        formatted,
        decimals
      });

      return formatted;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  // Validation functions for form inputs
  const validateTokenAmount = (amount, tokenAddress) => {
    if (!tokenAddress || !amount) return '';

    const symbol = getTokenSymbol(tokenAddress);
    if (!symbol || !balances[symbol]) return '';

    const balance = balances[symbol];
    const decimals = TOKEN_CONFIG[symbol].decimals;
    const userBalance = Number(formatUnits(balance, decimals));
    const enteredAmount = Number(amount);

    console.log('Validation check:', {
      symbol,
      balance,
      userBalance,
      enteredAmount
    });

    if (enteredAmount > userBalance) {
      return `Insufficient balance. You have ${userBalance.toFixed(6)} ${symbol} available`;
    }

    return '';
  };

  // Validates that the expiry time is at least 5 minutes in the future
  const validateExpiryTime = (time) => {
    if (!time) return '';

    const selectedTime = new Date(time);
    const minTime = new Date(Date.now() + 5 * 60 * 1000);

    if (selectedTime < minTime) {
      return 'Expiry time must be at least 5 minutes from now';
    }

    return '';
  };

  // Validates that the target valuation meets the 5% difference requirement
  const validateTargetValuation = (value) => {
    if (!value || !currentValuation) return '';

    const targetVal = parseFloat(value);
    const minChange = currentValuation * 0.05; // 5% change

    if (formData.isTargetHigher) {
      if (targetVal <= currentValuation + minChange) {
        return `Target must be at least $${(currentValuation + minChange).toFixed(2)}`;
      }
    } else {
      if (targetVal >= currentValuation - minChange) {
        return `Target must be at most $${(currentValuation - minChange).toFixed(2)}`;
      }
    }

    return '';
  };

  // Handler for updating token fields (address and amount)
  const updateToken = (index, field, value) => {
    const newTokens = [...formData.tokens];
    newTokens[index] = { ...newTokens[index], [field]: value };

    setFormData(prev => ({ ...prev, tokens: newTokens }));

    // Validate amount if both token and amount are present
    if (field === 'amount' && newTokens[index].address) {
      const error = validateTokenAmount(value, newTokens[index].address);
      setFieldErrors(prev => ({
        ...prev,
        tokenAmounts: {
          ...prev.tokenAmounts,
          [index]: error
        }
      }));
    }
  };

  // Handler for expiry time changes
  const handleExpiryChange = (e) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, expiryTime: newValue }));

    const error = validateExpiryTime(newValue);
    setFieldErrors(prev => ({ ...prev, expiryTime: error }));
  };

  // Handler for target valuation changes
  const handleTargetValuationChange = (e) => {
    const newValue = e.target.value;
    setFormData(prev => ({ ...prev, targetValuation: newValue }));

    const error = validateTargetValuation(newValue);
    setFieldErrors(prev => ({ ...prev, targetValuation: error }));
  };

  // Function to add a new token input field
  const addToken = () => {
    setFormData(prev => ({
      ...prev,
      tokens: [...prev.tokens, { address: '', amount: '' }]
    }));
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const errors = {
      tokenAmounts: {},
      expiryTime: '',
      targetValuation: ''
    };

    let isValid = true;

    // Check if we have at least 2 tokens selected
    const validTokens = formData.tokens.filter(t => t.address && t.amount);
    if (validTokens.length < 2) {
      errors.tokenAmounts.general = 'At least 2 tokens must be selected';
      isValid = false;
    }

    // Validate each token's amount against user's balance
    formData.tokens.forEach((token, index) => {
      if (token.amount && token.address) {
        const error = validateTokenAmount(token.amount, token.address);
        if (error) {
          errors.tokenAmounts[index] = error;
          isValid = false;
        }
      }
    });

    // Validate expiry time
    const expiryError = validateExpiryTime(formData.expiryTime);
    if (expiryError) {
      errors.expiryTime = expiryError;
      isValid = false;
    }

    // Validate target valuation
    const targetError = validateTargetValuation(formData.targetValuation);
    if (targetError) {
      errors.targetValuation = targetError;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isConnected) {
      console.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      await createDTF(formData);
    } catch (error) {
      // Check if error is user rejection
      if (error.code === 4001 || // MetaMask user rejected
        error.message?.includes('User rejected') ||
        error.message?.includes('User denied')) {
        console.log('Transaction cancelled by user');
      } else {
        console.error('Launch failed:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white"></h1>

      <div className="bg-black rounded-xl p-6 border border-white/20">

        <form onSubmit={handleLaunch} className="space-y-6">

          {/* DTF Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300">EGO Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full p-2 bg-card-dark border border-white/20 rounded-md text-text-primary"
              placeholder="Enter EGO name"
              required
            />
          </div>

          {/* Token Selection Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tokens (minimum 2 required)
            </label>
            {fieldErrors.tokenAmounts?.general && (
              <p className="text-red-500 text-sm mb-2">{fieldErrors.tokenAmounts.general}</p>
            )}
            {formData.tokens.map((token, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <div className="flex-1">
                  <select
                    value={token.address}
                    onChange={(e) => updateToken(index, 'address', e.target.value)}
                    className={`w-full p-2 bg-card-dark border border-white/20  ${fieldErrors.tokenAmounts[index] ? 'border-red-500' : ''} rounded-md text-white`}
                  >
                    <option value="">Select Token</option>
                    {Object.entries(SEPOLIA_CONTRACTS.TOKENS).map(([symbol, address]) => (
                      <option key={address} value={address}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={token.amount}
                    onChange={(e) => updateToken(index, 'amount', e.target.value)}
                    className={`w-full p-2 bg-card-dark border border-white/20  ${fieldErrors.tokenAmounts[index] ? 'border-red-500' : 'border-dark-border'} rounded-md text-white`}
                    placeholder="Amount"
                  />
                  {token.address && (
                    <div className="text-sm mt-1">
                      <div className="text-gray-400">
                        Available: {getTokenBalance(token.address)} {getTokenSymbol(token.address)}
                      </div>
                      {fieldErrors.tokenAmounts[index] && (
                        <div className="text-red-500">
                          {fieldErrors.tokenAmounts[index]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addToken}
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              + Add another token
            </button>
          </div>

          {/* Current Valuation Display */}
          <div className="p-4 bg-card-dark rounded-md border border-white/20">
            <div className="text-sm text-text-secondary">Current EGO Valuation</div>
            <div className="text-xl font-bold text-white">
              ${currentValuation.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>

          {/* Expiry Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300">EGO Expiry</label>
            <input
              type="datetime-local"
              value={formData.expiryTime}
              onChange={handleExpiryChange}
              min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
              className={`mt-1 block w-full p-2 bg-card-dark border border-white/20 ${fieldErrors.expiryTime ? 'border-red-500' : 'border-dark-border'} rounded-md text-white`}
            />
            <p className={`text-sm mt-3 ${fieldErrors.expiryTime ? 'text-red-500' : 'text-gray-400'}`}>
              {fieldErrors.expiryTime || 'Minimum 5 minutes from now'}
            </p>
          </div>

          {/* Target Valuation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Target Valuation</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={formData.targetValuation}
                onChange={handleTargetValuationChange}
                className={`mt-1 block w-full p-2 bg-card-dark border border-white/20 ${fieldErrors.targetValuation ? 'border-red-500' : 'border-dark-border'} rounded-md text-white`}
                placeholder="Enter target value"
              />
              <select
                value={formData.isTargetHigher}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, isTargetHigher: e.target.value === 'true' }));
                  const error = validateTargetValuation(formData.targetValuation);
                  setFieldErrors(prev => ({ ...prev, targetValuation: error }));
                }}
                className="mt-1 block w-40 p-2 bg-card-dark  border-dark-border rounded-md text-white border border-white/20"
              >
                <option value="true">Higher</option>
                <option value="false">Lower</option>
              </select>
            </div>
            <p className={`text-sm mt-3 ${fieldErrors.targetValuation ? 'text-red-500' : 'text-gray-400'}`}>
              {fieldErrors.targetValuation || `Must be at least 5% ${formData.isTargetHigher ? 'higher' : 'lower'} than current valuation`}
            </p>
          </div>

          {/* Submit Button and Status Display */}
          <button
            type="submit"
            disabled={status.stage !== 'idle' && status.stage !== 'error' && isProcessing}
            className={`w-full py-3 px-4 ${status.stage !== 'idle' ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
              } rounded-md text-white`}
            onClick={handleLaunch}
          >
            {status.stage === 'checking' && 'Checking Allowances...'}
            {status.stage === 'approving' && 'Approving Tokens...'}
            {status.stage === 'creating' && 'Creating DTF...'}
            {status.stage === 'complete' && 'DTF Created!'}
            {(status.stage === 'idle' || status.stage === 'error') && 'Launch EGO'}
          </button>

          {status.error && !status.error.includes('User denied') && (
            <div className="text-red-500 mt-2">{status.error}</div>
          )}

          {status.transactions.length > 0 && (
            <div className="mt-4">
              <h3>Transactions:</h3>
              {status.transactions.map((tx, i) => (
                <div key={i} className="text-sm text-text-secondary">
                  {tx.type === 'approval' ? 'Token Approval' : 'DTF Creation'}: {tx.hash}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateDTF;