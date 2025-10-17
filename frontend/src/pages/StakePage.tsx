import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TokenExchange } from '@/components/wallet/TokenExchange'

export const StakePage: React.FC = () => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">连接钱包</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-text-secondary">
              请先连接钱包以使用代币兑换功能
            </p>
            <div className="text-6xl">💰</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            代币兑换中心
          </h1>
          <p className="text-text-secondary">
            使用 ETH 购买 YD 代币，或将 YD 代币兑换为 ETH
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <TokenExchange />
        </div>

        {/* 使用说明 */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-primary-500 font-bold">1.</span>
                <div>
                  <strong>购买 YD 代币：</strong> 使用 ETH 按 1:4000 的汇率购买 YD 代币，用于购买课程
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-primary-500 font-bold">2.</span>
                <div>
                  <strong>出售 YD 代币：</strong> 将 YD 代币按相同汇率兑换回 ETH
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-primary-500 font-bold">3.</span>
                <div>
                  <strong>实时汇率：</strong> 兑换汇率固定为 1 ETH = 4000 YD，无滑点
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-primary-500 font-bold">4.</span>
                <div>
                  <strong>流动性保障：</strong> 合约维持充足的储备金确保随时兑换
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}