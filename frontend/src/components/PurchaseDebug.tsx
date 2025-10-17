import React from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { COURSE_MANAGER_ABI, YD_TOKEN_ABI, getContractAddress } from '@/config/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PurchaseDebugProps {
  courseId: string
  price: string
}

export const PurchaseDebug: React.FC<PurchaseDebugProps> = ({ courseId, price }) => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const ydTokenAddress = getContractAddress(chainId, 'YD_TOKEN')

  // 获取用户余额
  const { data: userBalance } = useReadContract({
    address: ydTokenAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  })

  // 获取授权额度
  const { data: allowance } = useReadContract({
    address: ydTokenAddress,
    abi: YD_TOKEN_ABI,
    functionName: 'allowance',
    args: address && courseManagerAddress ? [address, courseManagerAddress] : undefined,
    enabled: !!address && !!courseManagerAddress && isConnected,
  })

  // 获取课程信息
  const { data: courseInfo } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCourse',
    args: [courseId],
    enabled: !!courseId && !!courseManagerAddress,
  })

  // 检查是否已购买
  const { data: purchasedCourses } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  })

  const hasPurchased = purchasedCourses ? (purchasedCourses as string[]).includes(courseId) : false

  if (!isConnected) {
    return <div>请连接钱包以查看调试信息</div>
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>购买调试信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>基本信息:</strong>
            <div>课程ID: {courseId}</div>
            <div>价格: {price} YD</div>
            <div>用户地址: {address?.slice(0, 10)}...{address?.slice(-8)}</div>
            <div>链ID: {chainId}</div>
          </div>
          
          <div>
            <strong>合约地址:</strong>
            <div>YD Token: {ydTokenAddress?.slice(0, 10)}...{ydTokenAddress?.slice(-8)}</div>
            <div>Course Manager: {courseManagerAddress?.slice(0, 10)}...{courseManagerAddress?.slice(-8)}</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <strong>余额和授权:</strong>
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div>
              <div>YD余额: {userBalance ? formatEther(userBalance) : 'loading...'}</div>
              <div>授权额度: {allowance ? formatEther(allowance) : 'loading...'}</div>
            </div>
            <div>
              <div className={`${userBalance && userBalance >= BigInt(price + '000000000000000000') ? 'text-green-600' : 'text-red-600'}`}>
                余额足够: {userBalance && userBalance >= BigInt(price + '000000000000000000') ? '✓' : '✗'}
              </div>
              <div className={`${allowance && allowance >= BigInt(price + '000000000000000000') ? 'text-green-600' : 'text-red-600'}`}>
                授权足够: {allowance && allowance >= BigInt(price + '000000000000000000') ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <strong>课程状态:</strong>
          <div className="text-sm mt-2">
            <div>课程存在: {courseInfo ? '✓' : '✗'}</div>
            <div>已购买: {hasPurchased ? '✓' : '✗'}</div>
            {courseInfo && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <div>标题: {(courseInfo as any)[0]}</div>
                <div>创建者: {(courseInfo as any)[3]}</div>
                <div>激活状态: {(courseInfo as any)[4] ? '✓' : '✗'}</div>
                <div>购买数: {(courseInfo as any)[6]?.toString()}</div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-3">
          <strong>可能的问题:</strong>
          <div className="text-sm mt-2 space-y-1">
            {!courseInfo && <div className="text-red-600">• 课程不存在或无法获取</div>}
            {hasPurchased && <div className="text-yellow-600">• 已经购买过此课程</div>}
            {userBalance && userBalance < BigInt(price + '000000000000000000') && <div className="text-red-600">• YD代币余额不足</div>}
            {allowance && allowance < BigInt(price + '000000000000000000') && <div className="text-orange-600">• 需要增加授权额度</div>}
            {courseInfo && !(courseInfo as any)[4] && <div className="text-red-600">• 课程未激活</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}