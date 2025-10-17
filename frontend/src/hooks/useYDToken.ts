import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { YD_TOKEN_ABI, COURSE_MANAGER_ABI, getContractAddress, EXCHANGE_RATE } from '@/config/contracts'

// YD Token 余额查询
export const useYDTokenBalance = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId, 'YD_TOKEN')

  const { data: balance, refetch, isLoading } = useReadContract({
    address: contractAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // 每10秒刷新一次
    }
  })

  return {
    balance: balance ? formatEther(balance) : '0',
    balanceBigInt: balance || BigInt(0),
    refetch,
    isLoading
  }
}

// YD Token 基本信息
export const useYDTokenInfo = () => {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId, 'YD_TOKEN')

  const { data: name } = useReadContract({
    address: contractAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: contractAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: contractAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'decimals',
  })

  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'totalSupply',
  })

  return {
    name: name || 'YuanDao Platform Token',
    symbol: symbol || 'YD',
    decimals: decimals || 18,
    totalSupply: totalSupply ? formatEther(totalSupply) : '0',
  }
}

// ETH <-> YD 兑换功能
export const useTokenExchange = () => {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const { writeContract, isPending } = useWriteContract()

  // 使用 ETH 购买 YD 代币
  const buyTokens = async (ethAmount: string) => {
    return writeContract({
      address: contractAddress,
      abi: COURSE_MANAGER_ABI,
      functionName: 'buyTokens',
      value: parseEther(ethAmount),
    } as any)
  }

  // 出售 YD 代币获取 ETH
  const sellTokens = async (tokenAmount: string) => {
    return writeContract({
      address: contractAddress,
      abi: COURSE_MANAGER_ABI,
      functionName: 'sellTokens',
      args: [parseEther(tokenAmount)],
    } as any)
  }

  // 计算兑换比例
  const calculateTokensForETH = (ethAmount: string): string => {
    const ethValue = parseFloat(ethAmount)
    return (ethValue * EXCHANGE_RATE).toString()
  }

  const calculateETHForTokens = (tokenAmount: string): string => {
    const tokenValue = parseFloat(tokenAmount)
    return (tokenValue / EXCHANGE_RATE).toString()
  }

  return {
    buyTokens,
    sellTokens,
    calculateTokensForETH,
    calculateETHForTokens,
    isPending,
    exchangeRate: EXCHANGE_RATE,
  }
}

// YD Token 授权功能
export const useYDTokenApproval = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const ydTokenAddress = getContractAddress(chainId, 'YD_TOKEN')
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const { writeContract, isPending } = useWriteContract()

  // 检查授权额度
  const { data: allowance, refetch } = useReadContract({
    address: ydTokenAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, courseManagerAddress] : undefined,
    query: {
      enabled: !!address,
    }
  })

  // 授权代币使用
  const approve = async (amount: string) => {
    return writeContract({
      address: ydTokenAddress,
      abi: YD_TOKEN_ABI,
      functionName: 'approve',
      args: [courseManagerAddress, parseEther(amount)],
    } as any)
  }

  // 授权最大额度
  const approveMax = async () => {
    const maxAmount = BigInt(2) ** BigInt(256) - BigInt(1) // max uint256
    return writeContract({
      address: ydTokenAddress,
      abi: YD_TOKEN_ABI,
      functionName: 'approve',
      args: [courseManagerAddress, maxAmount],
    } as any)
  }

  return {
    allowance: allowance ? formatEther(allowance) : '0',
    allowanceBigInt: allowance || BigInt(0),
    approve,
    approveMax,
    isPending,
    refetch,
  }
}

// 获取兑换储备信息
export const useExchangeReserves = () => {
  const chainId = useChainId()
  const contractAddress = getContractAddress(chainId, 'COURSE_MANAGER')

  const { data: reserves, refetch } = useReadContract({
    address: contractAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getExchangeReserves',
    query: {
      refetchInterval: 30000, // 每30秒刷新
    }
  })

  return {
    ethReserve: reserves ? formatEther(reserves[0]) : '0',
    tokenReserve: reserves ? formatEther(reserves[1]) : '0',
    refetch,
  }
}