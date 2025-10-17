import React, { useState } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export const WalletConnect: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { connectors, connect, isPending, error } = useConnect()
  const { isConnected } = useAccount()

  if (isConnected) {
    return null
  }

  const handleConnect = (connector: any) => {
    connect({ connector })
    setIsModalOpen(false)
  }

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        loading={isPending}
      >
        连接钱包
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="连接钱包"
      >
        <div className="space-y-4">
          <p className="text-text-regular">
            选择一个钱包来连接芝麻糊大学平台
          </p>
          
          <div className="space-y-3">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="w-full flex items-center space-x-3 p-4 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  🔗
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-text-primary">
                    {connector.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {connector.name === 'MetaMask' && '浏览器扩展钱包'}
                    {connector.name === 'WalletConnect' && '扫码连接移动钱包'}
                    {connector.name === 'Coinbase Wallet' && 'Coinbase 官方钱包'}
                  </div>
                </div>
                <div className="text-text-secondary">
                  →
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-md">
              <p className="text-sm text-danger-600">
                连接失败: {error.message}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}