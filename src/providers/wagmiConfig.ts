import {base, mainnet, sepolia} from 'viem/chains';
import {http} from 'wagmi';

import {createConfig} from '@privy-io/wagmi';

// Replace these with your app's chains

export const wagmiConfig = createConfig({
  chains: [base, mainnet, sepolia],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});