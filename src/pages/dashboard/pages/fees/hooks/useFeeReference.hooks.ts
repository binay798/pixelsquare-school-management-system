import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getAcademicYearListSlice } from '@src/store/redux/dashboard/academicYear/academicYear.slice'
import { getClassListAction } from '@src/store/redux/dashboard/academics/classes/classes.slice'
import { getClassSectionList } from '@src/store/redux/dashboard/academics/classSections/sections.service'
import { IOption } from '../fees.helpers'

/**
 * Academic years, classes and (lazily) sections used by the fee filters.
 *
 * The shapes are the ones returned by the existing academic endpoints:
 * `schools/academic-years`, `academics/classes` and
 * `academics/classes/:classId/sections`.
 */
export function useFeeReference() {
  const dispatch = useDispatch()
  const { data: academicYears } = useSelector(
    (store) => store.academicYear.academicYearList
  )
  const { data: classList } = useSelector((store) => store.classes.getClassList)

  const [sectionsByClass, setSectionsByClass] = useState<
    Record<number, Academics.IClassSection[]>
  >({})

  useEffect(() => {
    if (!academicYears) {
      dispatch(getAcademicYearListSlice({ query: { page: 1, limit: 100 } }))
    }
  }, [dispatch, academicYears])

  useEffect(() => {
    if (!classList) {
      dispatch(getClassListAction({ onSuccess: () => undefined }))
    }
  }, [dispatch, classList])

  const ensureSections = useCallback(
    (classId?: number | null) => {
      if (!classId || sectionsByClass[classId]) {
        return
      }

      getClassSectionList(classId)
        .then((res) =>
          setSectionsByClass((prev) => ({
            ...prev,
            [classId]: res.data.map((row) => row.section_details),
          }))
        )
        .catch(() => setSectionsByClass((prev) => ({ ...prev, [classId]: [] })))
    },
    [sectionsByClass]
  )

  const years: IOption[] = (academicYears ?? []).map((year) => ({
    value: String(year.id),
    label: `${year.name}${year.is_active ? ' (active)' : ''}`,
  }))

  const classes: IOption[] = (classList?.rows ?? []).map((row) => ({
    value: String(row.class_details.id),
    label: row.class_details.name,
  }))

  const sectionsOf = (classId?: number | null) =>
    classId ? sectionsByClass[classId] ?? [] : []

  return { years, classes, sectionsOf, ensureSections }
}
