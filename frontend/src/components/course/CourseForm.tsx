import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { CourseCreationForm } from '@/types/course'
import { COURSE_MANAGER_ABI, getContractAddress } from '@/config/contracts'

interface CourseFormProps {
  onCancel: () => void
  onSubmit?: (data: CourseCreationForm) => void
}

const categories = [
  { value: 'development', label: '智能合约开发' },
  { value: 'defi', label: 'DeFi金融' },
  { value: 'nft', label: 'NFT与元宇宙' },
  { value: 'trading', label: '交易策略' },
  { value: 'infrastructure', label: '基础设施' },
]

const levels = [
  { value: '初级', label: '初级 - 适合新手' },
  { value: '中级', label: '中级 - 需要基础知识' },
  { value: '高级', label: '高级 - 专业进阶' },
]

export const CourseForm: React.FC<CourseFormProps> = ({ onCancel, onSubmit }) => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  
  const [formData, setFormData] = useState<CourseCreationForm>({
    title: '',
    description: '',
    price: '100', // 默认100 YD
    maxStudents: 100,
    category: 'development',
    duration: '',
    level: '初级',
    image: '',
    syllabus: [''],
  })

  const [errors, setErrors] = useState<Partial<CourseCreationForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 智能合约写入
  const { writeContract, data: hash, error: writeError } = useWriteContract()
  
  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleInputChange = (field: keyof CourseCreationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addSyllabusItem = () => {
    setFormData(prev => ({
      ...prev,
      syllabus: [...(prev.syllabus || []), '']
    }))
  }

  const removeSyllabusItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus?.filter((_, i) => i !== index) || []
    }))
  }

  const updateSyllabusItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus?.map((item, i) => i === index ? value : item) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CourseCreationForm> = {}

    if (!formData.title.trim()) {
      newErrors.title = '课程标题不能为空'
    }
    if (!formData.description.trim()) {
      newErrors.description = '课程描述不能为空'
    }
    
    const price = parseFloat(formData.price)
    if (!formData.price || price <= 0) {
      newErrors.price = '请输入有效的课程价格'
    } else if (price < 1) {
      newErrors.price = '课程价格不能少于 1 YD'
    } else if (price > 10000) {
      newErrors.price = '课程价格不能超过 10,000 YD'
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = '课程时长不能为空'
    }
    if (formData.maxStudents <= 0) {
      newErrors.maxStudents = '最大学员数必须大于0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 生成唯一的课程ID
  const generateCourseId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 5)
    return `course-${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('创建课程:', formData)
      console.log('合约地址:', courseManagerAddress)
      
      // 生成唯一课程ID
      const courseId = generateCourseId()
      const priceInWei = parseEther(formData.price)

      console.log('课程参数:', {
        courseId,
        title: formData.title,
        description: formData.description,
        price: priceInWei.toString(),
        category: formData.category
      })

      // 检查合约地址
      if (!courseManagerAddress) {
        throw new Error('合约地址未配置')
      }

      // 调用智能合约创建课程 - 修复类型错误
      await writeContract({
        address: courseManagerAddress as `0x${string}`,
        abi: COURSE_MANAGER_ABI,
        functionName: 'createCourse',
        args: [
          courseId,
          formData.title,
          formData.description,
          priceInWei,
          formData.category,
        ],
      })

      console.log('合约调用已提交，等待确认...')
      
    } catch (error) {
      console.error('创建课程失败:', error)
      let errorMessage = '创建课程失败，请重试'
      
      // 处理常见错误类型
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          errorMessage = '用户取消了交易'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = '账户余额不足'
        } else {
          errorMessage = `创建失败: ${error.message}`
        }
      }
      
      alert(errorMessage)
      setIsSubmitting(false)
    }
  }

  // 监听交易成功
  React.useEffect(() => {
    if (isSuccess) {
      alert('课程创建成功！交易已确认')
      if (onSubmit) {
        onSubmit(formData)
      }
      onCancel() // 返回到课程列表
      setIsSubmitting(false)
    }
  }, [isSuccess, formData, onSubmit, onCancel])

  // 监听写入错误
  React.useEffect(() => {
    if (writeError) {
      console.error('写入错误:', writeError)
      setIsSubmitting(false)
    }
  }, [writeError])

  const isLoading = isSubmitting || isConfirming

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>课程基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 连接状态提示 */}
          {!isConnected && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                请先连接钱包以创建课程
              </p>
            </div>
          )}

          {/* 合约信息调试 */}
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>调试信息:</strong> 链ID: {chainId}, 合约: {courseManagerAddress?.slice(0, 10)}...
          </div>

          {/* 错误提示 */}
          {writeError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                交易失败: {writeError.message}
              </p>
            </div>
          )}

          {/* 课程标题 */}
          <Input
            label="课程标题"
            placeholder="输入课程标题"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            fullWidth
          />

          {/* 课程描述 */}
          <Textarea
            label="课程描述"
            placeholder="详细描述课程内容和学习目标"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            rows={4}
            fullWidth
          />

          {/* 课程分类和难度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                课程分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full h-10 px-3 border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                难度等级
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value as '初级' | '中级' | '高级')}
                className="w-full h-10 px-3 border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 价格和学员数 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="课程价格 (YD)"
                type="number"
                step="1"
                min="1"
                max="10000"
                placeholder="100"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                fullWidth
              />
              <div className="text-xs text-text-secondary mt-1">
                价格范围：1 - 10,000 YD
              </div>
            </div>

            <Input
              label="最大学员数"
              type="number"
              min="1"
              placeholder="100"
              value={formData.maxStudents.toString()}
              onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
              error={errors.maxStudents ? `最大学员数必须大于0` : undefined}
              fullWidth
            />

            <Input
              label="课程时长"
              placeholder="8周"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              error={errors.duration}
              fullWidth
            />
          </div>

          {/* 交易状态提示 */}
          {isConfirming && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                正在等待区块链确认交易...请稍候
              </p>
            </div>
          )}

          {hash && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                交易已提交！哈希: {hash.slice(0, 20)}...
              </p>
            </div>
          )}

          {/* 价格参考信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-2">💡 价格参考</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>• 初级课程：100-500 YD</div>
                <div>• 中级课程：500-2000 YD</div>
                <div>• 高级课程：2000-5000 YD</div>
                <div>• 专业课程：5000+ YD</div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                兑换参考：1 ETH ≈ 4,000 YD
              </div>
            </div>
          </div>

          {/* 课程图片 */}
          <Input
            label="课程封面图片链接 (可选)"
            placeholder="https://example.com/image.jpg"
            value={formData.image || ''}
            onChange={(e) => handleInputChange('image', e.target.value)}
            fullWidth
          />

          {/* 课程大纲 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-primary">
                课程大纲
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSyllabusItem}
              >
                添加章节
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.syllabus?.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`第${index + 1}章节标题`}
                    value={item}
                    onChange={(e) => updateSyllabusItem(index, e.target.value)}
                    fullWidth
                  />
                  {formData.syllabus!.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSyllabusItem(index)}
                      className="whitespace-nowrap"
                    >
                      删除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isConnected}
              className="flex-1"
            >
              {isConfirming ? '确认中...' : isSubmitting ? '提交中...' : '创建课程'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}