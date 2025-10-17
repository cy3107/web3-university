import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CourseCard } from '@/components/course/CourseCard'
import { useCourses } from '@/hooks/useCourses'
// import { ContractDebug } from '@/components/ContractDebug'

const categories = [
  { id: 'all', name: '全部课程', icon: '📚' },
  { id: 'development', name: '智能合约开发', icon: '💻' },
  { id: 'defi', name: 'DeFi金融', icon: '💰' },
  { id: 'nft', name: 'NFT与元宇宙', icon: '🎨' },
  { id: 'trading', name: '交易策略', icon: '📈' },
]

export const HomePage: React.FC = () => {
  const { isConnected } = useAccount()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // 使用改进的课程数据 hook
  const { courses, isLoading, courseIds, error, refetch } = useCourses()

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background-base">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              芝麻糊大学
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Web3时代的去中心化教育平台
            </p>
            <p className="text-lg mb-12 text-primary-200 max-w-2xl mx-auto">
              通过区块链技术，连接全球优秀讲师与学习者，打造透明、公平、高质量的在线教育生态
            </p>
            {!isConnected && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  开始学习
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  成为讲师
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">1,234</div>
              <div className="text-text-secondary">注册学员</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">{courses.length}</div>
              <div className="text-text-secondary">优质课程</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">89</div>
              <div className="text-text-secondary">专业讲师</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-info-600 mb-2">12.5K</div>
              <div className="text-text-secondary">学习时长(小时)</div>
            </div>
          </div>
        </div>
      </section>

      {/* <ContractDebug /> */}

      {/* Course Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">热门课程</h2>
            <p className="text-lg text-text-secondary">
              精选优质课程，助你在Web3领域快速成长
            </p>
            {isLoading && (
              <div className="text-blue-600 mt-4">正在加载课程数据...</div>
            )}
            {error && (
              <div className="text-red-600 mt-4">加载出错: {error.message}</div>
            )}
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <Input
                placeholder="搜索课程..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 刷新按钮 */}
          <div className="flex justify-center mb-6">
            <Button 
              onClick={() => {
                refetch()
                console.log('手动刷新课程列表')
              }}
              variant="outline"
              disabled={isLoading}
            >
              🔄 刷新课程列表
            </Button>
          </div>

          {/* 调试信息 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">调试信息</h3>
            <p className="text-sm text-blue-800">
              找到 {courseIds.length} 个课程ID: {courseIds.join(', ')}
            </p>
            <p className="text-sm text-blue-800">
              已加载 {courses.length} 个课程详情
            </p>
            <p className="text-sm text-blue-800">
              加载状态: {isLoading ? '加载中' : '完成'}
            </p>
            {error && (
              <p className="text-sm text-red-800">
                错误: {error.message}
              </p>
            )}
          </div>

          {/* 课程列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* 各种空状态处理 */}
          {!isLoading && courses.length === 0 && courseIds.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                课程详情加载失败
              </h3>
              <p className="text-text-secondary mb-4">
                找到了课程ID但无法加载详情，可能是合约调用问题
              </p>
              <Button onClick={() => window.location.reload()}>
                重新加载页面
              </Button>
            </div>
          )}

          {!isLoading && courseIds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                还没有课程
              </h3>
              <p className="text-text-secondary">
                成为第一个创建课程的讲师吧！
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/creator'}>
                创建课程
              </Button>
            </div>
          )}

          {!isLoading && filteredCourses.length === 0 && courses.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                暂无符合条件的课程
              </h3>
              <p className="text-text-secondary">
                尝试调整搜索条件或浏览其他分类
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            准备开始你的Web3学习之旅？
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            加入芝麻糊大学，与全球学习者一起探索区块链技术的无限可能
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              浏览所有课程
            </Button>
            <Button size="lg" variant="outline">
              了解更多
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}