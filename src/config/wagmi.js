import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import {
  sepolia,
} from 'wagmi/chains';
import { http } from 'viem';

const { wallets } = getDefaultWallets({
  appName: 'DTF Protocol',
  projectId: 'b4ea937e86bfefe00379ab1e8fa9bbb8', // Your WalletConnect Project ID
});

export const config = getDefaultConfig({
  appName: 'DTF Protocol',
  projectId: 'b4ea937e86bfefe00379ab1e8fa9bbb8', // Your WalletConnect Project ID
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  wallets: wallets,
  ssr: false,
});