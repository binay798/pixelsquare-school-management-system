import { Box, Card, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { useFormik } from 'formik'
import { CREATE_ACADEMIC_YEAR_SCHEMA } from './academicYearForm.schema'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createAcademicYearSlice } from '@src/store/redux/dashboard/academicYear/academicYear.slice'
import { useNavigate } from 'react-router-dom'

export function AcademicYearForm() {
  const dispatch = useDispatch()
  const { loading: createAcaYrLoading } = useSelector(
    (store) => store.academicYear.createAcademicYear
  )
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      name: '',
      session_start_at: '',
      session_end_at: '',
      note: '',
    },
    onSubmit: (values) => {
      dispatch(
        createAcademicYearSlice({
          payload: values,
          onSuccess: () => {
            navigate('/dashboard/administrator/academic-year')
            formik.resetForm()
          },
        })
      )
    },
    validationSchema: CREATE_ACADEMIC_YEAR_SCHEMA,
  })

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Create Academic Year
        </Typography>
        <Typography variant="body2" mt={1}>
          Update the school&apos;s details to keep records accurate and
          up-to-date.
        </Typography>
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <Card sx={{ p: 2 }}>
          <FormBlock title="Academic Year Form">
            <Stack spacing={2}>
              <Stack direction={'row'} spacing={2}>
                <InputField
                  placeholder="Year"
                  labelDetail={{ required: true, text: 'Name' }}
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    formik.touched.name ? formik.errors.name : undefined
                  }
                />
                <CustomDatePicker
                  views={['month', 'year']}
                  labelDetail={{ text: 'Start session', required: true }}
                  name="session_start_at"
                  onChange={(e) => {
                    if (!isEmpty(e)) {
                      formik.handleChange('session_start_at')(
                        e.format('YYYY-MM-DD')
                      )
                    }
                  }}
                  textFieldProps={{
                    onBlur: formik.handleBlur,
                    error:
                      formik.touched.session_start_at &&
                      Boolean(formik.errors.session_start_at),
                    helperText: formik.touched.session_start_at
                      ? formik.errors.session_start_at
                      : undefined,
                  }}
                />
                <CustomDatePicker
                  // label={'"month" and "year"'}
                  views={['month', 'year']}
                  labelDetail={{ text: 'End session', required: true }}
                  name="session_end_at"
                  onChange={(e) => {
                    if (!isEmpty(e)) {
                      formik.handleChange('session_end_at')(
                        e.format('YYYY-MM-DD')
                      )
                    }
                  }}
                  minDate={moment(formik.values.session_start_at).add(
                    1,
                    'month'
                  )}
                  textFieldProps={{
                    onBlur: formik.handleBlur,
                    error:
                      formik.touched.session_end_at &&
                      Boolean(formik.errors.session_end_at),
                    helperText: formik.touched.session_end_at
                      ? formik.errors.session_end_at
                      : undefined,
                  }}
                />
              </Stack>
              <TextareaField
                multiline={true}
                placeholder="Write some notes..."
                labelDetail={{ text: 'Note', required: false }}
                variant="outlined"
                rows={3}
                name="note"
                value={formik.values.note}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>
          </FormBlock>
          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent={'flex-end'}
            spacing={2}
          >
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={createAcaYrLoading}
              type="submit"
              size="medium"
            >
              Submit
            </ButtonComp>
          </Stack>
        </Card>
      </form>
    </Box>
  )
}
