import React, { useState } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePurchaseCourse } from '@/hooks/usePurchaseCourse'
import { COURSE_MANAGER_ABI, getContractAddress } from '@/config/contracts'

// 模拟用户数据
const mockUserData = {
  nickname: '区块链学习者',
  avatar: '',
  joinDate: '2024-01-15',
  completedCourses: 3,
  totalLearningHours: 45,
  certificates: 2,
  achievements: [
    { name: '首次完课', icon: '🎓', date: '2024-02-01' },
    { name: '连续学习7天', icon: '🔥', date: '2024-02-15' },
    { name: '社区贡献者', icon: '🌟', date: '2024-03-01' },
  ]
}

// 课程进度模拟数据（实际应用中应该从链上或后端获取）
const mockCourseProgress = {
  'course-1': { progress: 75, nextLesson: '第8章：合约部署与验证' },
  'course-2': { progress: 30, nextLesson: '第3章：AMM机制原理' },
  'solidity-basics': { progress: 60, nextLesson: '第5章：事件与日志' },
  'defi-analysis': { progress: 20, nextLesson: '第2章：DeFi生态概览' },
}

export const ProfilePage: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    nickname: mockUserData.nickname,
    avatar: mockUserData.avatar,
  })

  const { userBalance, userBalanceBigInt, purchasedCourses } = usePurchaseCourse()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">连接钱包</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-text-secondary">
              请先连接钱包以查看个人资料
            </p>
            <div className="text-6xl">👤</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSave = () => {
    // TODO: 保存用户信息
    console.log('保存用户信息:', userInfo)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：用户信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {userInfo.nickname[0] || '用'}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        label="昵称"
                        value={userInfo.nickname}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, nickname: e.target.value }))}
                        fullWidth
                      />
                      <Input
                        label="头像链接"
                        placeholder="https://example.com/avatar.jpg"
                        value={userInfo.avatar}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, avatar: e.target.value }))}
                        fullWidth
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="flex-1">
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {userInfo.nickname}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        编辑资料
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">加入时间</span>
                    <span className="text-text-primary">{mockUserData.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">YD余额</span>
                    <span className="text-text-primary font-medium">
                      {parseFloat(userBalance).toFixed(0)} YD
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 学习统计 */}
            <Card>
              <CardHeader>
                <CardTitle>学习统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {purchasedCourses?.length || 0}
                    </div>
                    <div className="text-sm text-text-secondary">已购课程</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600 mb-1">
                      {mockUserData.completedCourses}
                    </div>
                    <div className="text-sm text-text-secondary">完成课程</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-600 mb-1">
                      {mockUserData.totalLearningHours}
                    </div>
                    <div className="text-sm text-text-secondary">学习小时</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info-600 mb-1">
                      {mockUserData.certificates}
                    </div>
                    <div className="text-sm text-text-secondary">获得证书</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 成就徽章 */}
            <Card>
              <CardHeader>
                <CardTitle>成就徽章</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUserData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">
                          {achievement.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {achievement.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：学习进度 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 已购买课程 */}
            <Card>
              <CardHeader>
                <CardTitle>我的课程</CardTitle>
              </CardHeader>
              <CardContent>
                {purchasedCourses && purchasedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {purchasedCourses.map((courseId) => (
                      <PurchasedCourseItem 
                        key={courseId} 
                        courseId={courseId}
                        progress={mockCourseProgress[courseId as keyof typeof mockCourseProgress]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      还没有购买课程
                    </h3>
                    <p className="text-text-secondary mb-4">
                      去发现优质课程，开始你的学习之旅
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                      浏览课程
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 学习历史 */}
            <Card>
              <CardHeader>
                <CardTitle>学习历史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        ✅
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">
                          区块链基础知识入门
                        </h4>
                        <p className="text-sm text-text-secondary">
                          完成时间：2024-02-01
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      查看证书
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        ✅
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">
                          以太坊开发环境搭建
                        </h4>
                        <p className="text-sm text-text-secondary">
                          完成时间：2024-01-20
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      查看证书
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// 单独的已购买课程组件
interface PurchasedCourseItemProps {
  courseId: string
  progress?: { progress: number; nextLesson: string }
}

const PurchasedCourseItem: React.FC<PurchasedCourseItemProps> = ({ courseId, progress }) => {
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')

  // 读取课程详细信息
  const { data: courseData } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCourse',
    args: [courseId],
  })

  if (!courseData) {
    return (
      <div className="border border-border-light rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  const [title, description, price, creator, isActive, createdAt, purchaseCount, category] = courseData
  const currentProgress = progress?.progress || 0

  return (
    <div className="border border-border-light rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-text-primary mb-1">
            {title}
          </h4>
          <p className="text-sm text-text-secondary line-clamp-2 mb-2">
            {description}
          </p>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>价格: {formatEther(price)} YD</span>
            <span>分类: {category}</span>
          </div>
        </div>
        <span className="text-sm font-medium text-primary-600 ml-4">
          {currentProgress}%
        </span>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">
          {progress?.nextLesson ? `下一节：${progress.nextLesson}` : '准备开始学习'}
        </span>
        <Button size="sm" onClick={() => window.location.href = `/course/${courseId}/learn`}>
          {currentProgress > 0 ? '继续学习' : '开始学习'}
        </Button>
      </div>
    </div>
  )
}