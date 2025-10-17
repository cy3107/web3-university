import React from 'react'
import { useReadContract, useChainId } from 'wagmi'
import { getContractAddress, COURSE_MANAGER_ABI } from '@/config/contracts'

export const ContractDebug: React.FC = () => {
  const chainId = useChainId()
  const courseManagerAddress = getContractAddress(chainId, 'COURSE_MANAGER')

  console.log('调试信息:', {
    chainId,
    courseManagerAddress,
  })

  // 尝试读取所有课程ID
  const { data: courseIds, error, isLoading } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getAllCourseIds',
  })

  // 尝试读取一个具体的课程
  const { data: courseData, error: courseError } = useReadContract({
    address: courseManagerAddress,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCourse',
    args: ['course-1'],
  })

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-4">合约调试信息</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>链ID:</strong> {chainId}</div>
        <div><strong>合约地址:</strong> {courseManagerAddress}</div>
        
        <div className="border-t pt-2 mt-2">
          <strong>getAllCourseIds:</strong>
          {isLoading && <span className="text-blue-600"> 加载中...</span>}
          {error && <span className="text-red-600"> 错误: {error.message}</span>}
          {courseIds && <span className="text-green-600"> 成功: [{(courseIds as string[]).join(', ')}]</span>}
        </div>
        
        <div className="border-t pt-2 mt-2">
          <strong>getCourse('course-1'):</strong>
          {courseError && <span className="text-red-600"> 错误: {courseError.message}</span>}
          {courseData && <span className="text-green-600"> 成功: 找到课程数据</span>}
        </div>
        
        {courseData && (
          <div className="border-t pt-2 mt-2">
            <strong>课程详情:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
              {JSON.stringify(courseData, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
              , 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}