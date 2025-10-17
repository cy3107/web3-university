export interface Course {
  id: number
  title: string
  description: string
  instructor: string
  instructorName?: string
  price: string
  maxStudents: number
  currentStudents: number
  category: string
  image?: string
  duration?: string
  level?: '初级' | '中级' | '高级'
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CourseCreationForm {
  title: string
  description: string
  price: string
  maxStudents: number
  category: string
  duration: string
  level: '初级' | '中级' | '高级'
  image?: string
  syllabus?: string[]
}

export interface CourseProgress {
  courseId: number
  studentAddress: string
  completedLessons: number
  totalLessons: number
  lastAccessedAt: string
  certificateIssued: boolean
}