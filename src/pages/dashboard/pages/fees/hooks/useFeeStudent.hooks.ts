import { useCallback, useEffect, useState } from 'react'
import { manageStudentServices } from '@src/store/redux/dashboard/manageStudents/manageStudents.service'

/**
 * Loads the full profile (class, section, guardians) of the selected student
 * through `GET /students/:studentId`. Used by the collection, wallet, invoice,
 * concession and refund screens to show who the money belongs to.
 */
export function useFeeStudent(initialStudentId?: number | null) {
  const [studentId, setStudentId] = useState<number | null>(
    initialStudentId ?? null
  )
  const [student, setStudent] = useState<Students.IStudentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const detail = await manageStudentServices.getStudentDetail(id)
      setStudent(detail.data)
    } catch {
      setStudent(null)
      setError('The student could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!studentId) {
      setStudent(null)

      return
    }

    load(studentId)
  }, [studentId, load])

  const reload = useCallback(() => {
    if (studentId) {
      load(studentId)
    }
  }, [studentId, load])

  return {
    studentId,
    setStudentId,
    student,
    loading,
    error,
    reload,
  }
}
