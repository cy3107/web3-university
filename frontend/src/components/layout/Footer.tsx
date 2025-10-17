import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                智
              </div>
              <span className="text-lg font-bold text-text-primary">芝麻糊大学</span>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Web3时代的去中心化教育平台，连接全球优秀讲师与学习者。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-primary-600">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-text-secondary hover:text-primary-600">
                <span className="sr-only">GitHub</span>
                🐱
              </a>
              <a href="#" className="text-text-secondary hover:text-primary-600">
                <span className="sr-only">Discord</span>
                💬
              </a>
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              产品
            </h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-text-secondary hover:text-primary-600">课程广场</a></li>
              <li><a href="/creator" className="text-text-secondary hover:text-primary-600">创作者中心</a></li>
              <li><a href="/stake" className="text-text-secondary hover:text-primary-600">AAVE质押</a></li>
              <li><a href="/profile" className="text-text-secondary hover:text-primary-600">个人中心</a></li>
            </ul>
          </div>

          {/* 支持链接 */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              支持
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-primary-600">帮助中心</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary-600">社区论坛</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary-600">联系我们</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary-600">意见反馈</a></li>
            </ul>
          </div>

          {/* 法律链接 */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              法律
            </h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-primary-600">隐私政策</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary-600">服务条款</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary-600">免责声明</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-secondary text-sm">
              © 2025 芝麻糊大学. All rights reserved.
            </p>
            <p className="text-text-secondary text-sm mt-2 md:mt-0">
              Powered by Web3 & IPFS Technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}