import { useCallback, useMemo } from 'react'
import { AsyncSelectField } from '@src/components/select/select.component'
import { manageStudentServices } from '@src/store/redux/dashboard/manageStudents/manageStudents.service'
import { feeSelectPortalProps } from '../fees.helpers'

export interface IStudentOption {
  value: number
  label: string
  description?: string
  classId?: number | null
  sectionId?: number | null
}

interface Props {
  value?: IStudentOption | null
  onChange: (option: IStudentOption | null) => void
  placeholder?: string
  isClearable?: boolean
  isDisabled?: boolean
}

const toOption = (row: Students.IStudentList['rows'][0]): IStudentOption => {
  const profile = row.user_profile_details
  const name = [profile?.firstname, profile?.lastname].filter(Boolean).join(' ')

  return {
    value: row.student_details?.id,
    label: name || `Student #${row.student_details?.id}`,
    description: [row.class_details?.name, row.class_section_details?.name]
      .filter(Boolean)
      .join(' · '),
    classId: row.class_details?.id ?? null,
    sectionId: row.class_section_details?.id ?? null,
  }
}

/**
 * Server side student search used by every fee operation (collect payment, assign
 * fees, concessions, refunds, wallet).
 *
 * It queries `GET /students?search=` (the existing student API) — no client side
 * array is ever used as a student source.
 */
export function FeeStudentSelect({
  value,
  onChange,
  placeholder = 'Search by student name',
  isClearable = true,
  isDisabled = false,
}: Props) {
  const loadOptions = useCallback(async (input: string) => {
    const res = await manageStudentServices.getStudentList(
      1,
      25,
      input || undefined
    )

    return (res.data?.rows ?? []).map(toOption)
  }, [])

  const selected = useMemo(() => value ?? null, [value])

  return (
    <AsyncSelectField<IStudentOption, false>
      isClearable={isClearable}
      isDisabled={isDisabled}
      cacheOptions
      defaultOptions
      placeholder={placeholder}
      value={selected}
      loadOptions={loadOptions}
      onChange={(option) => onChange((option as IStudentOption | null) ?? null)}
      formatOptionLabel={(option) => (
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{option.label}</div>
          {option.description ? (
            <div style={{ fontSize: 11.5, opacity: 0.7 }}>
              {option.description}
            </div>
          ) : null}
        </div>
      )}
      {...feeSelectPortalProps}
    />
  )
}
