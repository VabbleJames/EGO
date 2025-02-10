import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="flex items-center space-x-4"
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal}
                    className="px-4 py-2 bg-dark rounded-lg text-gray-300 hover:bg-dark-border"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <>
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 bg-dark rounded-lg text-gray-300 hover:bg-dark-border"
                  >
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="px-4 py-2 bg-dark rounded-lg text-gray-300 hover:bg-dark-border"
                  >
                    {account.displayBalance
                      ? `${account.displayBalance}`
                      : ''
                    }
                    {account.displayName}
                  </button>
                </>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default WalletConnect;