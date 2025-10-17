import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { NetworkSwitcher } from '@/components/wallet/NetworkSwitcher'
import { clsx } from 'clsx'

// 导航菜单项
const navigationItems = [
  { name: '课程广场', href: '/', icon: '📚' },
  { name: '创作者中心', href: '/creator', icon: '✍️' },
  { name: 'AAVE 质押', href: '/stake', icon: '💰' },
  { name: '个人中心', href: '/profile', icon: '👤' },
]

export const Header: React.FC = () => {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 格式化钱包地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo 区域 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                智
              </div>
              <span className="text-xl font-bold text-text-primary hidden sm:block">
                芝麻糊大学
              </span>
            </Link>
          </div>

          {/* 桌面端网络切换器 */}
          <div className="hidden md:flex items-center space-x-4">
            <NetworkSwitcher />
          </div>

          {/* 桌面端导航菜单 */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2',
                    isActive
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-text-regular hover:text-text-primary hover:bg-gray-50'
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-4">
            {/* 钱包连接区域 */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                {/* 钱包地址显示 */}
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-text-regular">
                    {formatAddress(address!)}
                  </span>
                </div>
                
                {/* 断开连接按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  className="hidden sm:flex"
                >
                  断开连接
                </Button>
              </div>
            ) : (
              <WalletConnect />
            )}

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-md text-text-regular hover:text-text-primary hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-light">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                        : 'text-text-regular hover:text-text-primary hover:bg-gray-50'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                )
              })}
              
              {/* 移动端钱包和网络信息 */}
              {isConnected && (
                <div className="px-4 py-3 border-t border-border-light space-y-3">
                  {/* 网络信息 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">当前网络</span>
                    <NetworkSwitcher />
                  </div>
                  
                  {/* 钱包信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-sm text-text-regular">
                        {formatAddress(address!)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        disconnect()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      断开
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}