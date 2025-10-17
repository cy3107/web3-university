// 1. 首先检查你的 COURSE_MANAGER_ABI 是否包含 courses 函数
// 在合约中，public mapping 会自动生成 getter 函数

// 修复方案1: 更新 usePurchaseCourse.ts - 使用 getCourse 替代 courses
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { readContract, simulateContract } from '@wagmi/core'
import { COURSE_MANAGER_ABI, YD_TOKEN_ABI, getContractAddress } from '@/config/contracts'
import { wagmiConfig } from '@/config/wagmi'

type PurchaseStep = 'idle' | 'checking' | 'approving' | 'waiting_approval' | 'purchasing' | 'success' | 'error'

export const usePurchaseCourse = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const ydTokenAddress = getContractAddress(chainId, 'YD_TOKEN')

  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [currentCourseId, setCurrentCourseId] = useState<string>('')
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0))
  
  // 智能合约写入hooks
  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract()
  const { writeContract: writePurchase, data: purchaseHash, error: purchaseError, reset: resetPurchase } = useWriteContract()
  
  // 交易确认hooks
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  })
  const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({ 
    hash: purchaseHash 
  })

  // 获取用户YD代币余额
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: ydTokenAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected && !!ydTokenAddress,
  })

  // 获取授权额度 - 实时监控
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ydTokenAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'allowance',
    args: address && courseManagerAddress ? [address, courseManagerAddress] : undefined,
    enabled: !!address && !!courseManagerAddress && isConnected && !!ydTokenAddress,
  })

  // 获取用户已购买的课程
  const { data: purchasedCourses, refetch: refetchPurchasedCourses } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected && !!courseManagerAddress,
  })

  const handleError = useCallback((message: string) => {
    console.error('🚨 购买流程错误:', message)
    setErrorMessage(message)
    setPurchaseStep('error')
    
    // 8秒后重置状态
    setTimeout(() => {
      setPurchaseStep('idle')
      setErrorMessage('')
    }, 8000)
  }, [])

  const getErrorMessage = useCallback((error: any): string => {
    const message = error.message || error.toString()
    
    console.log('🔍 原始错误信息:', message)
    
    if (message.includes('user rejected') || message.includes('User rejected')) {
      return '用户取消了交易'
    }
    if (message.includes('insufficient funds')) {
      return '账户ETH余额不足支付Gas费用'
    }
    if (message.includes('ERC20InsufficientBalance')) {
      return 'YD代币余额不足'
    }
    if (message.includes('ERC20InsufficientAllowance')) {
      return 'YD代币授权额度不足，请重新授权'
    }
    if (message.includes('Already purchased')) {
      return '您已经购买过这个课程'
    }
    if (message.includes('Course does not exist')) {
      return '课程不存在'
    }
    if (message.includes('Course is not active')) {
      return '课程未激活'
    }
    if (message.includes('Cannot buy your own course')) {
      return '不能购买自己的课程'
    }
    if (message.includes('Function') && message.includes('not found on ABI')) {
      return 'ABI配置错误，请检查合约接口定义'
    }
    if (message.includes('Internal JSON-RPC error')) {
      return '合约调用失败，请检查网络连接和合约状态'
    }
    
    return message.length > 100 ? message.substring(0, 100) + '...' : message
  }, [])

  // 安全的合约读取函数
  const safeReadContract = async (contractConfig: any) => {
    try {
      return await readContract(wagmiConfig, contractConfig)
    } catch (error) {
      console.error('合约读取失败:', error)
      throw error
    }
  }

  const executePurchase = useCallback(async (courseId?: string, price?: bigint) => {
    const courseIdToUse = courseId || currentCourseId
    const priceToUse = price || currentPrice
    
    console.log('🛒 开始执行购买交易')
    console.log('📝 当前购买状态:', {
      courseManagerAddress,
      courseId: courseIdToUse,
      price: priceToUse.toString(),
      formattedPrice: priceToUse > 0 ? formatEther(priceToUse) : 'N/A'
    })

    // 验证所有必需参数
    if (!courseManagerAddress || !courseIdToUse || priceToUse === BigInt(0) || !address || !ydTokenAddress) {
      handleError('参数验证失败')
      return
    }

    try {
      console.log('🔍 执行购买前的最终检查:')
      
      // 使用 getCourse 函数替代 courses mapping
      const courseInfo = await safeReadContract({
        address: courseManagerAddress as `0x${string}`,
        abi: COURSE_MANAGER_ABI,
        functionName: 'getCourse', // 使用 getCourse 函数而不是 courses
        args: [courseIdToUse]
      })
      
      console.log('📝 课程信息:', courseInfo)
      
      // 检查课程是否存在 (getCourse 返回的第一个元素是 title)
      if (!courseInfo || !courseInfo[0] || courseInfo[0] === '') {
        handleError('课程不存在或未激活')
        return
      }
      
      // 检查用户是否已购买
      const alreadyPurchased = await safeReadContract({
        address: courseManagerAddress as `0x${string}`,
        abi: COURSE_MANAGER_ABI,
        functionName: 'hasUserPurchasedCourse',
        args: [courseIdToUse, address]
      })
      
      if (alreadyPurchased) {
        handleError('您已经购买过这个课程')
        return
      }
      
      // 检查最新的余额和授权
      const [latestBalance, latestAllowance] = await Promise.all([
        safeReadContract({
          address: ydTokenAddress as `0x${string}`,
          abi: YD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [address]
        }),
        safeReadContract({
          address: ydTokenAddress as `0x${string}`,
          abi: YD_TOKEN_ABI,
          functionName: 'allowance',
          args: [address, courseManagerAddress]
        })
      ])
      
      console.log('💰 最新余额:', formatEther(latestBalance as bigint))
      console.log('🔓 最新授权:', formatEther(latestAllowance as bigint))
      
      if ((latestBalance as bigint) < priceToUse) {
        handleError(`YD余额不足: ${formatEther(latestBalance as bigint)} < ${formatEther(priceToUse)}`)
        return
      }
      
      if ((latestAllowance as bigint) < priceToUse) {
        handleError(`授权额度不足: ${formatEther(latestAllowance as bigint)} < ${formatEther(priceToUse)}`)
        return
      }

      // 使用 simulate 来预检查交易
      console.log('🧪 模拟交易执行...')
      
      try {
        await simulateContract(wagmiConfig, {
          address: courseManagerAddress as `0x${string}`,
          abi: COURSE_MANAGER_ABI,
          functionName: 'purchaseCourse',
          args: [courseIdToUse],
          account: address
        })
        console.log('✅ 交易模拟成功')
      } catch (simulateError) {
        console.error('❌ 交易模拟失败:', simulateError)
        handleError('交易预检查失败: ' + getErrorMessage(simulateError))
        return
      }

      // 执行实际交易
      console.log('📤 提交购买交易...')
      await writePurchase({
        address: courseManagerAddress as `0x${string}`,
        abi: COURSE_MANAGER_ABI,
        functionName: 'purchaseCourse',
        args: [courseIdToUse],
      })
      
      console.log('📤 购买交易已提交，等待确认...')
      
    } catch (error) {
      console.error('💥 购买交易提交失败:', error)
      handleError('购买交易失败: ' + getErrorMessage(error))
    }
  }, [courseManagerAddress, currentCourseId, currentPrice, address, ydTokenAddress, writePurchase, handleError, getErrorMessage])

  // 监听授权完成
  useEffect(() => {
    if (isApproveSuccess && (purchaseStep === 'approving' || purchaseStep === 'waiting_approval')) {
      console.log('✅ 授权交易确认成功')
      setPurchaseStep('waiting_approval')
      
      const checkAllowanceAndProceed = async () => {
        console.log('🔄 等待授权额度更新...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        await refetchAllowance()
        
        setTimeout(() => {
          console.log('🔍 检查最新授权额度...')
          console.log('当前授权:', allowance ? formatEther(allowance) : '0')
          console.log('需要授权:', formatEther(currentPrice))
          
          if (allowance && allowance >= currentPrice) {
            console.log('✅ 授权额度充足，开始购买')
            setPurchaseStep('purchasing')
            setTimeout(() => {
              executePurchase(currentCourseId, currentPrice)
            }, 1000)
          } else {
            console.log('❌ 授权额度不足，重试授权')
            handleError(`授权未生效，当前额度: ${allowance ? formatEther(allowance) : '0'} YD，需要: ${formatEther(currentPrice)} YD`)
          }
        }, 1000)
      }
      
      checkAllowanceAndProceed()
    }
  }, [isApproveSuccess, purchaseStep, allowance, currentPrice, currentCourseId, executePurchase, refetchAllowance, handleError])

  // 监听购买完成
  useEffect(() => {
    if (isPurchaseSuccess && purchaseStep === 'purchasing') {
      console.log('✅ 课程购买成功！')
      setPurchaseStep('success')
      
      setTimeout(() => {
        refetchPurchasedCourses()
        refetchBalance()
        refetchAllowance()
      }, 2000)
      
      setTimeout(() => {
        setPurchaseStep('idle')
        setCurrentCourseId('')
        setCurrentPrice(BigInt(0))
        resetApprove()
        resetPurchase()
      }, 5000)
    }
  }, [isPurchaseSuccess, purchaseStep, refetchPurchasedCourses, refetchBalance, refetchAllowance, resetApprove, resetPurchase])

  // 监听错误
  useEffect(() => {
    if (approveError && (purchaseStep === 'approving' || purchaseStep === 'waiting_approval')) {
      console.error('❌ 授权失败:', approveError)
      handleError('授权失败: ' + getErrorMessage(approveError))
    }
  }, [approveError, purchaseStep, handleError, getErrorMessage])

  useEffect(() => {
    if (purchaseError && purchaseStep === 'purchasing') {
      console.error('❌ 购买失败:', purchaseError)
      handleError('购买失败: ' + getErrorMessage(purchaseError))
    }
  }, [purchaseError, purchaseStep, handleError, getErrorMessage])

  const purchaseCourse = async (courseId: string, priceStr: string) => {
    if (!isConnected || !address) {
      handleError('请先连接钱包')
      return
    }

    if (!ydTokenAddress || !courseManagerAddress) {
      handleError('合约地址配置错误')
      return
    }

    console.log('🚀 启动购买流程')
    console.log('📋 购买参数:', { courseId, price: priceStr })

    try {
      resetApprove()
      resetPurchase()
      setErrorMessage('')
      
      const priceInWei = parseEther(priceStr)
      setCurrentCourseId(courseId)
      setCurrentPrice(priceInWei)
      setPurchaseStep('checking')

      console.log('📊 课程信息:', { courseId, price: priceStr, priceInWei: priceInWei.toString() })

      console.log('🔄 获取最新账户数据...')
      
      const [latestBalance, latestAllowance, latestPurchased] = await Promise.all([
        safeReadContract({
          address: ydTokenAddress as `0x${string}`,
          abi: YD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [address]
        }),
        safeReadContract({
          address: ydTokenAddress as `0x${string}`,
          abi: YD_TOKEN_ABI,
          functionName: 'allowance',
          args: [address, courseManagerAddress]
        }),
        safeReadContract({
          address: courseManagerAddress as `0x${string}`,
          abi: COURSE_MANAGER_ABI,
          functionName: 'hasUserPurchasedCourse',
          args: [courseId, address]
        })
      ])

      console.log('📋 账户状态检查:')
      console.log('  - 余额:', formatEther(latestBalance as bigint), 'YD')
      console.log('  - 授权:', formatEther(latestAllowance as bigint), 'YD') 
      console.log('  - 需要:', priceStr, 'YD')
      console.log('  - 已购买:', latestPurchased)

      // 验证条件
      if (latestPurchased) {
        handleError('您已经购买过这个课程')
        return
      }

      if ((latestBalance as bigint) < priceInWei) {
        handleError(`YD余额不足: ${formatEther(latestBalance as bigint)} < ${priceStr}`)
        return
      }

      // 检查是否需要授权
      const needsApproval = (latestAllowance as bigint) < priceInWei
      
      if (needsApproval) {
        console.log('🔐 需要授权，开始授权流程')
        console.log('  - 当前授权:', formatEther(latestAllowance as bigint))
        console.log('  - 需要授权:', priceStr)
        
        setPurchaseStep('approving')

        const approvalAmount = priceInWei * BigInt(10)
        
        console.log('📝 提交授权交易，授权金额:', formatEther(approvalAmount), 'YD')

        await writeApprove({
          address: ydTokenAddress as `0x${string}`,
          abi: YD_TOKEN_ABI,
          functionName: 'approve',
          args: [courseManagerAddress, approvalAmount],
        })

        console.log('📤 授权交易已提交，等待确认...')
      } else {
        console.log('✅ 授权充足，直接购买')
        setPurchaseStep('purchasing')
        
        setTimeout(() => {
          executePurchase(courseId, priceInWei)
        }, 1000)
      }

    } catch (error) {
      console.error('💥 购买流程启动失败:', error)
      handleError('启动失败: ' + getErrorMessage(error))
    }
  }

  // 检查用户是否已购买某课程
  const hasPurchased = (courseId: string): boolean => {
    if (!purchasedCourses) return false
    return (purchasedCourses as string[]).includes(courseId)
  }

  // 检查余额是否足够
  const hasEnoughBalance = (priceStr: string): boolean => {
    if (!userBalance) return false
    try {
      const priceInWei = parseEther(priceStr)
      return userBalance >= priceInWei
    } catch {
      return false
    }
  }

  // 格式化余额显示
  const formattedBalance = userBalance ? formatEther(userBalance) : '0'

  const isLoading = isApproveConfirming || isPurchaseConfirming || 
                   ['checking', 'approving', 'waiting_approval', 'purchasing'].includes(purchaseStep)

  return {
    purchaseStep,
    errorMessage,
    isLoading,
    purchaseCourse,
    hasPurchased,
    userBalance: formattedBalance,
    hasEnoughBalance,
    refetchPurchasedCourses,
    allowance: allowance ? formatEther(allowance) : '0',
  }
}