import React, { useState } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CourseForm } from '@/components/course/CourseForm'
import { useCreatorCourses } from '@/hooks/useCourses'
import { COURSE_MANAGER_ABI, getContractAddress } from '@/config/contracts'

export const CreatorPage: React.FC = () => {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // 使用统一的创作者课程hook
  const { courses: creatorCourses, isLoading, error, refetch, stats } = useCreatorCourses(address)

  // 获取创作者收益
  const { data: creatorEarnings } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCreatorEarnings',
    args: address ? [address] : undefined,
    enabled: !!courseManagerAddress && !!address && isConnected,
  })

  // 处理课程创建成功后的回调
  const handleCourseCreated = () => {
    console.log('课程创建成功，刷新数据...')
    setShowCreateForm(false)
    // 延迟刷新，确保区块链数据已更新
    setTimeout(() => {
      refetch()
    }, 2000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">连接钱包</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-text-secondary">
              请先连接钱包以访问创作者中心
            </p>
            <div className="text-6xl">🔗</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            创作者中心
          </h1>
          <p className="text-text-secondary">
            管理你的课程，查看收益和学员数据
          </p>
          <div className="mt-2 text-sm text-text-secondary">
            创作者地址: {address?.slice(0, 10)}...{address?.slice(-8)}
          </div>
        </div>

        {!showCreateForm ? (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {stats.totalCourses}
                  </div>
                  <div className="text-text-secondary">发布课程</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-success-600 mb-2">
                    {stats.totalStudents}
                  </div>
                  <div className="text-text-secondary">总学员数</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-warning-600 mb-2">
                    {creatorEarnings ? `${formatEther(creatorEarnings as bigint)} YD` : `${stats.totalRevenue} YD`}
                  </div>
                  <div className="text-text-secondary">总收益</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-info-600 mb-2">4.8</div>
                  <div className="text-text-secondary">平均评分</div>
                </CardContent>
              </Card>
            </div>

            {/* 操作按钮和刷新 */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">我的课程</h2>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={refetch}
                  disabled={isLoading}
                >
                  🔄 刷新数据
                </Button>
                <Button onClick={() => setShowCreateForm(true)}>
                  创建新课程
                </Button>
              </div>
            </div>

            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="text-blue-600">正在加载创作者数据...</div>
              </div>
            )}

            {/* 错误状态 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800">加载出错: {error.message}</p>
              </div>
            )}

            {/* 调试信息 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">调试信息</h3>
              <p className="text-sm text-gray-700">
                创作者地址: {address} |
                我的课程数: {creatorCourses.length} |
                链ID: {chainId} |
                合约: {courseManagerAddress?.slice(0, 10)}...
              </p>
              {creatorEarnings && (
                <p className="text-sm text-gray-700">
                  链上收益: {formatEther(creatorEarnings as bigint)} YD
                </p>
              )}
            </div>

            {/* 课程列表 */}
            {!isLoading && (
              <div className="space-y-4">
                {creatorCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {course.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <span>课程ID: {course.id}</span>
                            <span>学员: {course.currentStudents}人</span>
                            <span>价格: {course.price} YD</span>
                            <span>收益: {(parseFloat(course.price) * course.currentStudents).toFixed(2)} YD</span>
                            <span className={course.isActive ? 'text-success-600' : 'text-warning-600'}>
                              {course.isActive ? '进行中' : '已停用'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button variant="outline" size="sm">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm">
                            数据
                          </Button>
                          <Button size="sm">
                            管理
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 空状态处理 */}
            {!isLoading && creatorCourses.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    还没有发布课程
                  </h3>
                  <p className="text-text-secondary mb-6">
                    开始创建你的第一门课程，分享知识并获得收益
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    创建课程
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
                className="mr-4"
              >
                ← 返回
              </Button>
              <h2 className="text-xl font-semibold text-text-primary">创建新课程</h2>
            </div>
            <CourseForm 
              onCancel={() => setShowCreateForm(false)}
              onSubmit={handleCourseCreated}
            />
          </div>
        )}
      </div>
    </div>
  )
}