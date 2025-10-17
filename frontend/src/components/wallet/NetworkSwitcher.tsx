import React, { useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

const supportedNetworks = [
  {
    chainId: 31337,
    name: 'Localhost',
    shortName: 'Local',
    icon: '🔧',
    color: 'bg-green-500',
  },
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'Sepolia',
    icon: '⚡',
    color: 'bg-yellow-500',
  },
]

export const NetworkSwitcher: React.FC = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  const currentNetwork = supportedNetworks.find(network => network.chainId === chainId)
  console.log('NetworkSwitcher rendered:', chainId, currentNetwork)
  if (!isConnected) {
    return null
  }

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId })
      setIsOpen(false)
    } catch (error) {
      console.error('网络切换失败:', error)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center space-x-2 min-w-[120px]"
      >
        <div className={clsx(
          'w-3 h-3 rounded-full',
          currentNetwork?.color || 'bg-gray-400'
        )} />
        <span className="text-sm">
          {isPending ? '切换中...' : (currentNetwork?.shortName || '未知网络')}
        </span>
        <svg
          className={clsx(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-light z-20">
            <div className="p-2">
              <div className="text-xs text-text-secondary px-3 py-2 border-b border-border-lighter">
                选择网络
              </div>
              
              {supportedNetworks.map((network) => {
                const isActive = network.chainId === chainId
                
                return (
                  <button
                    key={network.chainId}
                    onClick={() => handleNetworkSwitch(network.chainId)}
                    disabled={isPending || isActive}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-3 py-3 rounded-md text-left transition-colors',
                      'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                      isActive && 'bg-primary-50 border border-primary-200'
                    )}
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm',
                      network.color
                    )}>
                      {network.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className={clsx(
                        'font-medium',
                        isActive ? 'text-primary-600' : 'text-text-primary'
                      )}>
                        {network.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Chain ID: {network.chainId}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="text-primary-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            <div className="px-3 py-2 border-t border-border-lighter">
              <div className="text-xs text-text-secondary">
                当前连接: {currentNetwork?.name || '未知网络'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}