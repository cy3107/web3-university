import { useState, useEffect } from 'react'
import { useReadContract, useChainId } from 'wagmi'
import { formatEther, createPublicClient, http } from 'viem'
import { hardhat } from 'viem/chains'
import { COURSE_MANAGER_ABI, getContractAddress } from '@/config/contracts'

export interface Course {
  id: string
  title: string
  description: string
  price: string
  instructor: string
  instructorName?: string
  isActive: boolean
  createdAt: bigint
  purchaseCount: number
  category: string
  image: string
  duration: string
  level: "初级" | "中级" | "高级"
  maxStudents: number
  currentStudents: number
}

// 辅助函数
function getImageForCategory(category: string): string {
  const images = {
    development: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    defi: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    nft: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400',
    trading: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    infrastructure: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400',
  }
  return images[category as keyof typeof images] || images.development
}

function getDurationForCategory(category: string): string {
  const durations = {
    development: '8周',
    defi: '10周',
    nft: '6周',
    trading: '12周',
    infrastructure: '8周',
  }
  return durations[category as keyof typeof durations] || '8周'
}

function getLevelForCategory(category: string): "初级" | "中级" | "高级" {
  const levels = {
    development: '初级' as const,
    defi: '中级' as const,
    nft: '初级' as const,
    trading: '高级' as const,
    infrastructure: '中级' as const,
  }
  return levels[category as keyof typeof levels] || '初级'
}

function getInstructorName(address: string): string {
  return `讲师 ${address.slice(0, 6)}...${address.slice(-4)}`
}

export const useCourses = () => {
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // 获取所有课程ID
  const { 
    data: courseIds, 
    isLoading: isLoadingIds, 
    refetch: refetchIds,
    error: idsError 
  } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getAllCourseIds',
  })

  // 获取单个课程详情的函数
  const fetchCourseDetails = async (courseId: string): Promise<Course | null> => {
    if (!courseManagerAddress) return null

    try {
      console.log(`获取课程 ${courseId} 详情`)

      // 创建公共客户端进行合约调用
      const client = createPublicClient({
        chain: chainId === 31337 ? hardhat : hardhat, // 根据需要调整链配置
        transport: http()
      })

      const courseData = await client.readContract({
        address: courseManagerAddress,
        abi: COURSE_MANAGER_ABI,
        functionName: 'getCourse',
        args: [courseId],
      }) as any[]

      console.log(`课程 ${courseId} 原始数据:`, courseData)

      if (!courseData || courseData.length < 8) {
        console.warn(`课程 ${courseId} 数据格式错误:`, courseData)
        return null
      }

      const [title, description, price, creator, isActive, createdAt, purchaseCount, category] = courseData

      return {
        id: courseId,
        title: title || `课程 ${courseId}`,
        description: description || '暂无描述',
        price: formatEther(price || BigInt(0)),
        instructor: creator,
        instructorName: getInstructorName(creator),
        isActive: Boolean(isActive),
        createdAt: BigInt(createdAt || 0),
        purchaseCount: Number(purchaseCount || 0),
        category: category || 'development',
        image: getImageForCategory(category || 'development'),
        duration: getDurationForCategory(category || 'development'),
        level: getLevelForCategory(category || 'development'),
        maxStudents: 100, // 默认值
        currentStudents: Number(purchaseCount || 0),
      }

    } catch (error) {
      console.error(`获取课程 ${courseId} 详情失败:`, error)
      
      // 如果区块链调用失败，返回基础信息以便调试
      return {
        id: courseId,
        title: `课程 ${courseId} (调试模式)`,
        description: `无法从区块链获取详情的课程 ${courseId}`,
        price: '0',
        instructor: '0x0000000000000000000000000000000000000000',
        instructorName: '未知讲师',
        isActive: true,
        createdAt: BigInt(Date.now()),
        purchaseCount: 0,
        category: 'development',
        image: getImageForCategory('development'),
        duration: getDurationForCategory('development'),
        level: getLevelForCategory('development'),
        maxStudents: 100,
        currentStudents: 0,
      }
    }
  }

  // 当课程ID变化时，获取所有课程详情
  useEffect(() => {
    const loadAllCourses = async () => {
      if (!courseIds || (courseIds as string[]).length === 0) {
        setCourses([])
        return
      }

      setIsLoadingDetails(true)
      console.log('开始批量获取课程详情:', courseIds)

      try {
        const coursePromises = (courseIds as string[]).map(id => fetchCourseDetails(id))
        const results = await Promise.all(coursePromises)
        const validCourses = results.filter((course): course is Course => course !== null)
        
        setCourses(validCourses)
        console.log(`成功加载 ${validCourses.length} 个课程:`, validCourses)
      } catch (error) {
        console.error('批量获取课程详情失败:', error)
      } finally {
        setIsLoadingDetails(false)
      }
    }

    loadAllCourses()
  }, [courseIds, courseManagerAddress, chainId])

  const isLoading = isLoadingIds || isLoadingDetails

  const refetch = () => {
    console.log('手动刷新课程数据')
    refetchIds()
  }

  return {
    courses,
    isLoading,
    courseIds: (courseIds as string[]) || [],
    error: idsError,
    refetch,
  }
}

// 获取单个课程详情的Hook
export const useCourse = (courseId: string) => {
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')

  const { data: courseData, isLoading, error, refetch } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCourse',
    args: [courseId],
    enabled: !!courseId && !!courseManagerAddress,
  })

  let course: Course | null = null

  if (courseData) {
    const [title, description, price, creator, isActive, createdAt, purchaseCount, category] = courseData as any[]
    
    course = {
      id: courseId,
      title: title || `课程 ${courseId}`,
      description: description || '暂无描述',
      price: formatEther(price || BigInt(0)),
      instructor: creator,
      instructorName: getInstructorName(creator),
      isActive: Boolean(isActive),
      createdAt: BigInt(createdAt || 0),
      purchaseCount: Number(purchaseCount || 0),
      category: category || 'development',
      image: getImageForCategory(category || 'development'),
      duration: getDurationForCategory(category || 'development'),
      level: getLevelForCategory(category || 'development'),
      maxStudents: 100,
      currentStudents: Number(purchaseCount || 0),
    }
  }

  return {
    course,
    isLoading,
    error,
    refetch,
  }
}

// 获取创作者课程的Hook
export const useCreatorCourses = (creatorAddress?: string) => {
  const { courses, isLoading, error, refetch } = useCourses()
  const [creatorCourses, setCreatorCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!creatorAddress) {
      setCreatorCourses([])
      return
    }

    const filtered = courses.filter(course =>
      course.instructor.toLowerCase() === creatorAddress.toLowerCase()
    )
    setCreatorCourses(filtered)
  }, [courses, creatorAddress])

  const stats = {
    totalCourses: creatorCourses.length,
    totalStudents: creatorCourses.reduce((sum, course) => sum + course.currentStudents, 0),
    totalRevenue: creatorCourses.reduce((sum, course) => {
      const price = parseFloat(course.price)
      return sum + (price * course.currentStudents)
    }, 0).toString(),
  }

  return {
    courses: creatorCourses,
    isLoading,
    error,
    refetch,
    stats,
  }
}