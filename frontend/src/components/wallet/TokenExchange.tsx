import React, { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useYDTokenBalance, useTokenExchange, useExchangeReserves } from '@/hooks/useYDToken'

export const TokenExchange: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { data: ethBalance } = useBalance({ address })
  const { balance: ydBalance, refetch: refetchYD } = useYDTokenBalance()
  const { ethReserve, tokenReserve, refetch: refetchReserves } = useExchangeReserves()
  
  const {
    buyTokens,
    sellTokens,
    calculateTokensForETH,
    calculateETHForTokens,
    isPending,
    exchangeRate,
  } = useTokenExchange()

  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')

  const handleBuyTokens = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('请输入有效的ETH数量')
      return
    }

    try {
      await buyTokens(buyAmount)
      setBuyAmount('')
      // 刷新余额
      setTimeout(() => {
        refetchYD()
        refetchReserves()
      }, 2000)
    } catch (error) {
      console.error('购买代币失败:', error)
      alert('购买失败，请重试')
    }
  }

  const handleSellTokens = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      alert('请输入有效的YD代币数量')
      return
    }

    try {
      await sellTokens(sellAmount)
      setSellAmount('')
      // 刷新余额
      setTimeout(() => {
        refetchYD()
        refetchReserves()
      }, 2000)
    } catch (error) {
      console.error('出售代币失败:', error)
      alert('出售失败，请重试')
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-text-secondary">请先连接钱包</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 余额显示 */}
      <Card>
        <CardHeader>
          <CardTitle>钱包余额</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'} ETH
              </div>
              <div className="text-sm text-text-secondary">以太币</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {parseFloat(ydBalance).toFixed(2)} YD
              </div>
              <div className="text-sm text-text-secondary">YD代币</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 兑换率信息 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">兑换汇率</span>
            <span className="font-semibold">1 ETH = {exchangeRate.toLocaleString()} YD</span>
          </div>
        </CardContent>
      </Card>

      {/* 兑换操作 */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'bg-primary-500 text-white'
                  : 'text-text-regular hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('buy')}
            >
              购买 YD
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'sell'
                  ? 'bg-primary-500 text-white'
                  : 'text-text-regular hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('sell')}
            >
              出售 YD
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === 'buy' ? (
            // 购买 YD 代币
            <div className="space-y-4">
              <Input
                label="支付 ETH 数量"
                type="number"
                step="0.001"
                placeholder="0.1"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                endIcon={
                  <button
                    onClick={() => setBuyAmount(ethBalance ? (parseFloat(ethBalance.formatted) * 0.9).toFixed(4) : '0')}
                    className="text-primary-600 text-xs hover:text-primary-700"
                  >
                    最大
                  </button>
                }
                fullWidth
              />

              {buyAmount && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="text-sm text-primary-700">
                    将获得: <span className="font-semibold">{calculateTokensForETH(buyAmount)} YD</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBuyTokens}
                loading={isPending}
                disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                className="w-full"
                size="lg"
              >
                {isPending ? '购买中...' : '购买 YD 代币'}
              </Button>
            </div>
          ) : (
            // 出售 YD 代币
            <div className="space-y-4">
              <Input
                label="出售 YD 数量"
                type="number"
                step="1"
                placeholder="1000"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                endIcon={
                  <button
                    onClick={() => setSellAmount((parseFloat(ydBalance) * 0.9).toFixed(0))}
                    className="text-primary-600 text-xs hover:text-primary-700"
                  >
                    最大
                  </button>
                }
                helperText={`可用余额: ${parseFloat(ydBalance).toFixed(2)} YD`}
                fullWidth
              />

              {sellAmount && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                  <div className="text-sm text-success-700">
                    将获得: <span className="font-semibold">{calculateETHForTokens(sellAmount)} ETH</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSellTokens}
                loading={isPending}
                disabled={!sellAmount || parseFloat(sellAmount) <= 0}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPending ? '出售中...' : '出售 YD 代币'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 流动性储备信息 */}
      <Card>
        <CardHeader>
          <CardTitle>流动性储备</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">ETH 储备</span>
              <span className="font-medium">{parseFloat(ethReserve).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">YD 储备</span>
              <span className="font-medium">{parseFloat(tokenReserve).toLocaleString()} YD</span>
            </div>
            <div className="border-t pt-3">
              <div className="text-xs text-text-secondary">
                储备比例维持 1:4000 的兑换汇率
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}