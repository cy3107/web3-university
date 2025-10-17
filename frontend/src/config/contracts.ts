import { Address } from 'viem'

// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // 本地网络 (Hardhat)
  31337: {
    YD_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    COURSE_MANAGER: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
  },
  // Sepolia 测试网地址
  11155111: {
    YD_TOKEN: (import.meta.env.VITE_SEPOLIA_YD_TOKEN_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as Address,
    COURSE_MANAGER: (import.meta.env.VITE_SEPOLIA_COURSE_MANAGER_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') as Address,
  }
} as const

// 支持的链ID类型
type SupportedChainId = keyof typeof CONTRACT_ADDRESSES
type ContractName = keyof typeof CONTRACT_ADDRESSES[31337]

// 获取当前链的合约地址 - 修复返回类型
export const getContractAddress = (chainId: number, contract: ContractName): Address => {
  const supportedChainId = chainId as SupportedChainId
  const addresses = CONTRACT_ADDRESSES[supportedChainId] || CONTRACT_ADDRESSES[31337]
  const address = addresses[contract]
  
  if (!address) {
    throw new Error(`Contract ${contract} not found for chain ${chainId}`)
  }
  
  return address
}

// YDToken 合约 ABI
export const YD_TOKEN_ABI = [
  {
    "inputs": [{"name": "initialOwner", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "recipients", "type": "address[]"}, {"name": "amounts", "type": "uint256[]"}],
    "name": "batchTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// CourseManager 合约 ABI
export const COURSE_MANAGER_ABI = [
  {
    "inputs": [{"name": "_ydToken", "type": "address"}, {"name": "initialOwner", "type": "address"}],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"name": "courseId", "type": "string"},
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "price", "type": "uint256"},
      {"name": "category", "type": "string"}
    ],
    "name": "createCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "courseId", "type": "string"}],
    "name": "purchaseCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "courseId", "type": "string"},
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "price", "type": "uint256"}
    ],
    "name": "updateCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "courseId", "type": "string"}],
    "name": "deactivateCourse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenAmount", "type": "uint256"}],
    "name": "sellTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "courseId", "type": "string"}],
    "name": "getCourse",
    "outputs": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "price", "type": "uint256"},
      {"name": "creator", "type": "address"},
      {"name": "isActive", "type": "bool"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "purchaseCount", "type": "uint256"},
      {"name": "category", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCourseIds",
    "outputs": [{"name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserPurchasedCourses",
    "outputs": [{"name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "courseId", "type": "string"}, {"name": "user", "type": "address"}],
    "name": "hasUserPurchasedCourse",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getExchangeReserves",
    "outputs": [{"name": "_ethReserve", "type": "uint256"}, {"name": "_tokenReserve", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "ethAmount", "type": "uint256"}],
    "name": "calculateTokensForETH",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenAmount", "type": "uint256"}],
    "name": "calculateETHForTokens",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"name": "creator", "type": "address"}],
    "name": "getCreatorEarnings",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initializeTokenReserve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "addETHReserve",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const

// 合约常量
export const EXCHANGE_RATE = 4000 // 1 ETH = 4000 YD
export const FEE_RATE = 500 // 5% (500/10000)
export const MIN_COURSE_PRICE = BigInt(1e18) // 1 YD
export const MAX_COURSE_PRICE = BigInt(10000e18) // 10000 YD