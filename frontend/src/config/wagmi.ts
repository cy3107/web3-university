import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// 自定义本地链配置
const localChain = {
  id: 31337,
  name: 'Local Hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
} as const

// 从环境变量获取配置
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
const infuraKey = import.meta.env.VITE_INFURA_API_KEY

if (!projectId) {
  throw new Error('VITE_WALLET_CONNECT_PROJECT_ID is not defined')
}

// 定义支持的链
export const chains = [localChain, sepolia, mainnet] as const

// 创建 Wagmi 配置
const isLocal = import.meta.env.VITE_APP_ENV === 'local'
const baseUrl = isLocal ? 'http://localhost:5173' : 'https://zhimahu.work'
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: '芝麻糊大学',
        url: baseUrl,
        iconUrl: `${baseUrl}/favicon.ico`,
      },
    }),
    walletConnect({
      projectId,
      metadata: {
        name: '芝麻糊大学',
        description: 'Web3 去中心化教育平台',
        url: 'https://zhimahu.work',
        icons: ['https://zhimahu.work/favicon.ico'],
      },
    }),
    coinbaseWallet({
      appName: '芝麻糊大学',
      appLogoUrl: 'https://zhimahu.work/favicon.ico',
    }),
  ],
  transports: {
    [localChain.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${infuraKey}`),
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${infuraKey}`),
  },
})

// 导出类型
export type Config = typeof wagmiConfig