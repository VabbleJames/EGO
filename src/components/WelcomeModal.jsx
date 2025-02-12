import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogOverlay, 
  DialogPortal,
  DialogTitle 
} from '@/components/ui/dialog';

export default function WelcomeModal({ isOpen: externalIsOpen, onClose: externalOnClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (externalIsOpen === undefined) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setTimeout(() => {
          setInternalIsOpen(true);
        }, 9500); // 3 second delay after load
      }
    }
  }, [externalIsOpen]);

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    
    if (dontShow) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  };

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="!bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="bg-[#0A0A0A] border border-white/20 p-6 max-w-lg mx-auto">
          <DialogTitle className="text-2xl font-bold text-white mb-6">How EGO works:</DialogTitle>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-white font-bold">1.</span>
              <p className="text-gray-300">Whales create baskets (EGOs) of tokens and set a future valuation.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-white font-bold">2.</span>
              <p className="text-gray-300">You buy YES or NO shares if you think it will meet the valuation or not.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-white font-bold">3.</span>
              <p className="text-gray-300">If you're right, you can sell your shares for $1 each on the bonding curve.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-white font-bold">4.</span>
              <p className="text-gray-300">
                Whales get 1.2% of fees from every trade.
                <span className="text-gray-500 text-sm ml-1">
                  (Further fees: EGO Platform: 1%, Insurance: 0.3%)
                </span>
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3">How to use EGO Testnet?</h3>
            <p className="text-gray-300">
              Add Sepolia network to your wallet. Get ETH, USDC, LINK, and AAVE from a faucet. More info on sepolia tokens can be found here (https://gho.aave.com/markets/) .
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3">What's Next?</h3>
            <p className="text-gray-300">
              Using EGO on testnet and early mainnet may give you a future airdrop of an ecosystem token.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3">wen AI?</h3>
            <p className="text-gray-300">
              EGO is a prediction market, not a bookies. This system offers unique insights into the future value of tokens, how people feel about the price, and how traders combine/build token portfolios. With this data, we will build an AI system of EGO agents which you can use to help predict, trade, and build your own crypto fortune.
            </p>
          </div>

          <div className="flex items-center justify-between mt-8">
            {!externalIsOpen && (
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="rounded bg-transparent border-white/20"
                />
                Don't show again
              </label>
            )}
            
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg transition-colors font-bold text-lg"
            >
              LFG
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}