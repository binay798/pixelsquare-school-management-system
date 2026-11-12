import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'
import { AsyncSelectField } from '@src/components/select/select.component'
import Select from 'react-select'
import { CustomSwitch } from '@src/components/switch/switch.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  attachStudentToGuardianAction,
  searchAvailableStudentsAction,
} from '@src/store/redux/dashboard/guardian/guardian.slice'
import { useFormik } from 'formik'
import { useState } from 'react'
import { SingleValue } from 'react-select'
import {
  PERMISSION_FIELDS,
  RELATIONSHIP_OPTIONS,
} from '../../guardian.constants'

interface IStudentOption {
  label: string
  value: number
}

interface Props {
  open: boolean
  guardianId: number
  onClose: () => void
  onSuccess: () => void
}

const initialPermissions: Guardian.IPermissionFlags = {
  can_pickup_student: true,
  can_view_academics: true,
  can_view_fees: false,
  receives_announcements: true,
  is_emergency_contact: false,
}

export function LinkStudentModal(props: Props) {
  const dispatch = useDispatch()
  const attaching = useSelector((store) => store.guardians.link.attach)
  const [selectedStudent, setSelectedStudent] = useState<IStudentOption | null>(
    null
  )
  const [studentError, setStudentError] = useState('')

  const formik = useFormik({
    initialValues: {
      relationship: '',
      notes: '',
      ...initialPermissions,
    },
    onSubmit: (values) => {
      if (!selectedStudent) {
        setStudentError('Please select a student to link.')
        return
      }

      dispatch(
        attachStudentToGuardianAction({
          guardianId: props.guardianId,
          payload: {
            student_id: selectedStudent.value,
            relationship:
              (values.relationship as Guardian.TRelationship) || null,
            notes: values.notes.trim() || null,
            can_pickup_student: values.can_pickup_student,
            can_view_academics: values.can_view_academics,
            can_view_fees: values.can_view_fees,
            receives_announcements: values.receives_announcements,
            is_emergency_contact: values.is_emergency_contact,
          },
          onSuccess: () => {
            props.onClose()
            props.onSuccess()
          },
        })
      )
    },
  })

  const loadStudents = async (search: string) => {
    const result = await dispatch(
      searchAvailableStudentsAction({
        guardianId: props.guardianId,
        search,
        page: 1,
        limit: 20,
      })
    ).unwrap()

    return (result?.data?.rows ?? []).map((row) => ({
      value: row.student_details.id,
      label: `${row.user_profile_details.firstname} ${
        row.user_profile_details.lastname
      }${
        row.student_academic_year_details?.roll_no
          ? ` (Roll ${row.student_academic_year_details.roll_no})`
          : ''
      }${row.class_details?.name ? ` · ${row.class_details.name}` : ''}${
        row.class_section_details?.name
          ? ` - ${row.class_section_details.name}`
          : ''
      }`,
    }))
  }

  const closeModal = () => {
    if (attaching) return
    setSelectedStudent(null)
    setStudentError('')
    formik.resetForm()
    props.onClose()
  }

  return (
    <SpringModal open={props.open} close={closeModal} size="sm" noPadding>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ p: 3, width: 560, maxWidth: '90vw' }}
      >
        <Typography variant="h6" fontWeight={600}>
          Link Student
        </Typography>
        <Typography variant="body2" mt={0.5} color={colors.grey[600]}>
          Attach a student to this guardian and configure access permissions.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <FormControl fullWidth error={Boolean(studentError)} required>
            <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[600] }}>
              Student
            </FormLabel>
            <AsyncSelectField<IStudentOption, false>
              placeholder="Search student by name or roll number"
              isClearable
              cacheOptions
              defaultOptions
              menuPortalTarget={document.body}
              loadOptions={loadStudents}
              value={selectedStudent}
              onChange={(option: SingleValue<IStudentOption>) => {
                setSelectedStudent(option ?? null)
                setStudentError('')
              }}
            />
            {studentError && <FormHelperText>{studentError}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[600] }}>
              Relationship
            </FormLabel>
            <Select<{ label: string; value: Guardian.TRelationship }, false>
              placeholder="Select relationship"
              options={RELATIONSHIP_OPTIONS}
              isClearable
              value={
                RELATIONSHIP_OPTIONS.find(
                  (option) => option.value === formik.values.relationship
                ) ?? null
              }
              onChange={(
                option: SingleValue<{
                  label: string
                  value: Guardian.TRelationship
                }>
              ) => formik.setFieldValue('relationship', option?.value ?? '')}
            />
          </FormControl>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={1}>
              Permissions
            </Typography>
            <Stack spacing={1}>
              {PERMISSION_FIELDS.map((permission) => (
                <Stack
                  key={permission.key}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    border: `1px solid ${colors.grey[200]}`,
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {permission.label}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[600]}>
                      {permission.description}
                    </Typography>
                  </Box>
                  <CustomSwitch
                    checked={Boolean(formik.values[permission.key])}
                    onChange={(event) =>
                      formik.setFieldValue(permission.key, event.target.checked)
                    }
                  />
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box>
            <FormLabel sx={{ fontSize: 13, mb: 1, color: colors.grey[600] }}>
              Notes
            </FormLabel>
            <InputField
              fullWidth
              name="notes"
              placeholder="Optional notes about this link"
              value={formik.values.notes}
              onChange={formik.handleChange}
              multiline
              rows={2}
            />
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <ButtonComp
            type="button"
            variant="outlined"
            onClick={closeModal}
            disabled={attaching}
          >
            Cancel
          </ButtonComp>
          <ButtonComp type="submit" disabled={attaching}>
            {attaching ? 'Linking...' : 'Link Student'}
          </ButtonComp>
        </Stack>
      </Box>
    </SpringModal>
  )
}
