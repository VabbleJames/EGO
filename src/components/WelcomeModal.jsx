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
        }, 9500);
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
        <DialogContent className="bg-[#0A0A0A] border border-white/20 p-6 max-w-lg mx-auto overflow-y-auto max-h-[90vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] sm:w-full">
          <div className="space-y-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">How EGO works:</DialogTitle>

            <div className="space-y-4">
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
                <p className="text-gray-300">If you're right, sell your shares on the bonding curve to lock in profits.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-white font-bold">4.</span>
                <p className="text-gray-300">
                  Whales get 1.2% of fees from every trade.
                  <span className="text-gray-500 text-sm block mt-1">
                    (Further fees: EGO Platform: 1%, Insurance: 0.3%)
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">How to use EGO Testnet?</h3>
              <p className="text-gray-300">
                Add Sepolia network to your wallet. Get ETH, USDC, LINK, and AAVE from a faucet. More info on sepolia tokens can be found here (https://gho.aave.com/markets/).
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">What's Next?</h3>
              <p className="text-gray-300">
                Using EGO on testnet and early mainnet may give you a future airdrop of an ecosystem token.
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">wen AI?</h3>
              <p className="text-gray-300">
                EGO is a prediction market, not a bookies. This system offers unique insights into the future value of tokens, how people feel about the price, and how traders combine/build token portfolios. With this data, we will build an AI system of EGO agents which you can use to help predict, trade, and build your own crypto fortune.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              {!externalIsOpen && (
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer order-2 sm:order-1">
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
                className="w-full sm:w-auto px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg transition-colors font-bold text-lg order-1 sm:order-2"
              >
                LFG
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}