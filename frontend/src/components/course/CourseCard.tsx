import React from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePurchaseCourse } from '@/hooks/usePurchaseCourse'

interface Course {
  id: string
  title: string
  description: string
  price: string
  instructor: string
  instructorName?: string
  image: string
  level: string
  duration: string
  currentStudents: number
  maxStudents: number
}

interface CourseCardProps {
  course: Course
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { isConnected } = useAccount()
  
  // 确保所有 hooks 都在组件顶部无条件调用
  const { 
    purchaseStep, 
    errorMessage, 
    isLoading, 
    purchaseCourse, 
    hasPurchased,
    userBalance,
    hasEnoughBalance
  } = usePurchaseCourse()

  const handlePurchase = async () => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }
    
    // 检查MetaMask是否可用
    if (!window.ethereum) {
      alert('未检测到MetaMask')
      return
    }
    
    // 检查网络连接
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0x7a69') { // 31337 in hex
        alert('请切换到本地测试网络')
        return
      }
    } catch (error) {
      alert('网络连接异常，请检查MetaMask')
      return
    }
    
    await purchaseCourse(course.id, course.price)
  }

  const handlePreview = () => {
    console.log('预览课程:', course.id)
    // TODO: 实现预览逻辑
  }

  const handleStartLearning = () => {
    // 跳转到课程学习页面
    window.location.href = `/course/${course.id}/learn`
  }

  // 计算进度百分比
  const progressPercentage = (course.currentStudents / course.maxStudents) * 100
  const isCourseFull = course.currentStudents >= course.maxStudents
  const userHasPurchased = hasPurchased(course.id)
  const enoughBalance = hasEnoughBalance(course.price)

  // 获取当前购买状态的显示文本和样式
  const getPurchaseStatusDisplay = () => {
    switch (purchaseStep) {
      case 'checking':
        return {
          text: '检查中...',
          className: 'text-blue-600 bg-blue-50',
          showProgress: true
        }
      case 'approving':
        return {
          text: '正在等待授权确认...请在钱包中确认授权交易',
          className: 'text-orange-600 bg-orange-50',
          showProgress: true
        }
      case 'waiting_approval':
        return {
          text: '授权确认中，准备购买...',
          className: 'text-blue-600 bg-blue-50',
          showProgress: true
        }
      case 'purchasing':
        return {
          text: '正在处理购买交易...请在钱包中确认购买交易',
          className: 'text-purple-600 bg-purple-50',
          showProgress: true
        }
      case 'success':
        return {
          text: '购买成功！可以开始学习了',
          className: 'text-green-600 bg-green-50',
          showProgress: false
        }
      case 'error':
        return {
          text: errorMessage,
          className: 'text-red-600 bg-red-50',
          showProgress: false
        }
      default:
        return null
    }
  }

  const statusDisplay = getPurchaseStatusDisplay()

  return (
    <div className="h-full">
      <Card hover className="h-full flex flex-col">
        {/* 课程图片 */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
              {course.level}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
              {course.duration}
            </span>
          </div>
          {userHasPurchased && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 bg-success-500 text-white text-xs rounded-full">
                已购买
              </span>
            </div>
          )}
        </div>

        <CardHeader className="flex-1">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-3">
              {course.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 讲师信息 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-xs font-semibold">
                {course.instructorName?.[0] || '师'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">
                {course.instructorName || '匿名讲师'}
              </div>
              <div className="text-xs text-text-secondary">
                {course.instructor.slice(0, 6)}...{course.instructor.slice(-4)}
              </div>
            </div>
          </div>

          {/* 学员进度 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">学员进度</span>
              <span className="text-text-primary">
                {course.currentStudents}/{course.maxStudents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* 价格 */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-600">
              {parseFloat(course.price).toFixed(0)} YD
            </div>
            <div className="text-sm text-text-secondary">
              ≈ ${(parseFloat(course.price) * 0.5).toFixed(2)} USD
            </div>
          </div>

          {/* 用户余额显示 - 仅在连接时显示 */}
          {isConnected && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">我的余额:</span>
              <span className={`font-medium ${enoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(userBalance).toFixed(0)} YD
              </span>
            </div>
          )}

          {/* 购买状态提示 */}
          {statusDisplay && (
            <div className={`text-sm p-3 rounded-md ${statusDisplay.className}`}>
              <div className="flex items-center gap-2">
                {statusDisplay.showProgress && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{statusDisplay.text}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="space-y-3">
          {/* 操作按钮 */}
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePreview}
              disabled={isLoading}
            >
              预览
            </Button>
            
            {userHasPurchased ? (
              <Button
                className="flex-1"
                onClick={handleStartLearning}
                disabled={isLoading}
              >
                {purchaseStep === 'success' ? '开始学习' : '继续学习'}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handlePurchase}
                disabled={!isConnected || isCourseFull || isLoading || !enoughBalance}
                loading={isLoading}
              >
                {!isConnected 
                  ? '连接钱包' 
                  : !enoughBalance
                    ? '余额不足'
                  : isCourseFull 
                    ? '已满员'
                    : isLoading
                      ? (purchaseStep === 'approving' ? '授权中...' : 
                         purchaseStep === 'waiting_approval' ? '准备购买...' :
                         purchaseStep === 'purchasing' ? '购买中...' : 
                         purchaseStep === 'checking' ? '检查中...' : '处理中...')
                      : '购买课程'
                }
              </Button>
            )}
          </div>

          {/* 余额不足提示 */}
          {isConnected && !userHasPurchased && !enoughBalance && (
            <div className="w-full text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/exchange'}
                className="text-xs"
                disabled={isLoading}
              >
                余额不足，去兑换YD代币
              </Button>
            </div>
          )}

          {/* 课程特色标签 */}
          <div className="flex flex-wrap gap-1 w-full">
            <span className="px-2 py-1 bg-success-50 text-success-600 text-xs rounded">
              ✓ 终身访问
            </span>
            <span className="px-2 py-1 bg-warning-50 text-warning-600 text-xs rounded">
              🏆 完课证书
            </span>
            <span className="px-2 py-1 bg-info-50 text-info-600 text-xs rounded">
              💬 社区支持
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* 调试信息 - 开发环境显示，生产环境移除 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <strong>调试信息:</strong>
          <div>课程ID: {course.id}</div>
          <div>价格: {course.price} YD</div>
          <div>余额: {userBalance} YD</div>
          <div>购买状态: {purchaseStep}</div>
          <div>已购买: {userHasPurchased ? '是' : '否'}</div>
          <div>余额足够: {enoughBalance ? '是' : '否'}</div>
        </div>
      )}
    </div>
  )
}