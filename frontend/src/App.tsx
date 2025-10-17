import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { wagmiConfig } from '@/config/wagmi'
// import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { CreatorPage } from '@/pages/CreatorPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { StakePage } from '@/pages/StakePage'
import './styles/globals.css'
import { wagmiConfig } from './config/wagmi'
import { Header } from './components/layout/Header'
// import '@/styles/globals.css'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      gcTime: 10 * 60 * 1000,   // 10 分钟
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

// 404 页面组件
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-secondary mb-4">404</h1>
        <p className="text-xl text-text-regular mb-8">页面未找到</p>
        <a 
          href="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background-base flex flex-col">
            {/* 页面头部 */}
            <Header />
            
            {/* 主要内容区域 */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/creator" element={<CreatorPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/stake" element={<StakePage />} />
                {/* 404 页面 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            {/* 页面底部 */}
            <Footer />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App