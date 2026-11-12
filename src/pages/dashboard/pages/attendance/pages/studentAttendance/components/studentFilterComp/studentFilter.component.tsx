import { FormControl } from '@mui/material'
import {
  customReactSelectStyles,
  SelectField,
} from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { AttendanceFieldLabel } from '@src/pages/dashboard/pages/attendance/components/attendanceFilters/attendanceFilters.component'

export interface ClassSectionOption {
  label: string
  value: number
}

interface Props {
  classValue: ClassSectionOption | null
  sectionValue: ClassSectionOption | null
  classOptions: ClassSectionOption[]
  sectionOptions: ClassSectionOption[]
  classLoading?: boolean
  sectionLoading?: boolean
  onClassChange: (option: ClassSectionOption | null) => void
  onSectionChange: (option: ClassSectionOption | null) => void
  disabled?: boolean
}

const selectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
  control: (provided, state) => ({
    ...(customReactSelectStyles.control?.(provided, state) ?? provided),
    minHeight: 40,
  }),
}

/**
 * Class / class section pair of the student sheet. Both selects are controlled
 * by the page: the sheet, the day and the drafts are loaded from the selection,
 * so the dropdowns cannot keep a state of their own.
 */
export function StudentFilter({
  classValue,
  sectionValue,
  classOptions,
  sectionOptions,
  classLoading = false,
  sectionLoading = false,
  onClassChange,
  onSectionChange,
  disabled = false,
}: Props) {
  return (
    <>
      <FormControl fullWidth>
        <AttendanceFieldLabel>Class</AttendanceFieldLabel>
        <SelectField
          placeholder="Select class"
          isLoading={classLoading}
          isDisabled={disabled}
          options={classOptions}
          value={classValue}
          styles={selectStyles}
          onChange={(option) =>
            onClassChange((option as ClassSectionOption | null) ?? null)
          }
        />
      </FormControl>

      <FormControl fullWidth>
        <AttendanceFieldLabel>Class section</AttendanceFieldLabel>
        <SelectField
          placeholder="Select class section"
          isLoading={sectionLoading}
          isDisabled={disabled || !classValue || sectionLoading}
          options={sectionOptions}
          value={sectionValue}
          styles={selectStyles}
          onChange={(option) =>
            onSectionChange((option as ClassSectionOption | null) ?? null)
          }
        />
      </FormControl>
    </>
  )
}
