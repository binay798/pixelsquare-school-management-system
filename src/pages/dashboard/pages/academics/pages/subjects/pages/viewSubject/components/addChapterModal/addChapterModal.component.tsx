import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import SpringModal from '@src/components/modal/modal.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { useFormik } from 'formik'
import { SelectField } from '@src/components/select/select.component'
import { ButtonComp } from '@src/components/button/button.component'
import { IoAddOutline } from 'react-icons/io5'
import { createChapterSchema } from './addChapterModal.schema'
import { capitalize, isEmpty } from 'lodash'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import moment from 'moment'
import { createChapterAction } from '@src/store/redux/dashboard/academics/subjects/subjects.slice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LOCAL_STORAGE,
  LOCAL_STORAGE_STATE,
} from '@src/constants/global.constants'

interface Props {
  open: boolean
  onClose: () => void
}
export function AddChapterModal(props: Props) {
  const { subjectId } = useParams()
  const [classId, setClassId] = useState<number | null>(null)
  const dispatch = useDispatch()
  const { loading: createChapterLoading } = useSelector(
    (store) => store.subjects.createChapter
  )

  useEffect(() => {
    const classIdVal = LOCAL_STORAGE.getItem(LOCAL_STORAGE_STATE.classId)
    if (!isEmpty(classIdVal)) {
      setClassId(Number(classIdVal))
    }
  }, [])

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      duration: '',
      deadline: '',
      chapter_number: '',
      difficulty_level: 'easy',
      status: 'active',
      objectives: '',
    },
    onSubmit: (values, { resetForm }) => {
      if (!subjectId || !classId) return

      dispatch(
        createChapterAction({
          classId,
          subjectId: Number(subjectId),
          body: {
            name: values.name,
            description: values.description || undefined,
            duration: Number(values.duration),
            deadline: values.deadline,
            subject_id: Number(subjectId),
            chapter_number: Number(values.chapter_number),
            difficulty_level: values.difficulty_level,
            status: values.status,
            objectives: values.objectives || undefined,
          },
          onSuccess: () => {
            resetForm()
            props.onClose()
          },
        })
      )
    },
    validationSchema: createChapterSchema,
  })

  return (
    <Box>
      <SpringModal noPadding close={props.onClose} open={props.open}>
        <Box>
          {/* HEADER */}
          <Box p={2} borderBottom="1px solid" borderColor={colors.grey[300]}>
            <Typography variant="h6" fontWeight={'bold'}>
              Add New Chapter
            </Typography>
            <Typography color="secondary" variant="caption">
              For Mathematics (Math-101)
            </Typography>
          </Box>
          {/* MAIN BODY */}
          <form onSubmit={formik.handleSubmit}>
            <Box p={2}>
              {/* TOP BODY */}
              <Box mb={3}>
                <Typography
                  color={colors.grey[800]}
                  variant="caption"
                  fontWeight={500}
                >
                  BASIC INFORMATION
                </Typography>
                <Stack mt={1} mb={2} direction="row" spacing={1}>
                  <InputField
                    placeholder="e.g 5"
                    labelDetail={{ text: 'Ch No.', required: true }}
                    value={formik.values.chapter_number}
                    onChange={formik.handleChange}
                    name="chapter_number"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.chapter_number &&
                      Boolean(formik.errors.chapter_number)
                    }
                    helperText={
                      formik.touched.chapter_number
                        ? formik.errors.chapter_number
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="e.g Algebric Expressions"
                    labelDetail={{ text: 'Chapter Name', required: true }}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    name="name"
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={
                      formik.touched.name ? formik.errors.name : undefined
                    }
                  />
                </Stack>
                <TextareaField
                  placeholder="Brief overview of the chapter..."
                  labelDetail={{ text: 'Description', required: false }}
                  variant="outlined"
                  multiline
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  name="description"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                />
              </Box>
              <Divider component="div" />
              {/* BOTTOM BODY */}
              <Box mt={2} mb={2}>
                <Typography
                  color={colors.grey[800]}
                  variant="caption"
                  fontWeight={500}
                >
                  ACADEMIC DETAILS
                </Typography>
                <Stack direction="row" spacing={1} mt={2} mb={2}>
                  <InputField
                    placeholder="e.g. 10"
                    labelDetail={{ required: true, text: 'Teaching Hours' }}
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    name="duration"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.duration && Boolean(formik.errors.duration)
                    }
                  />
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontSize: 13,
                        mb: 1,
                        color: colors.grey[800],
                      }}
                    >
                      Difficulty Level
                    </FormLabel>
                    <SelectField
                      placeholder="Difficylty Level"
                      onChange={(e) => {
                        formik.setFieldValue(
                          'difficulty_level',
                          (e as { value: string }).value
                        )
                      }}
                      value={{
                        label: capitalize(formik.values.difficulty_level),
                        value: formik.values.difficulty_level,
                      }}
                      options={[
                        { label: 'Easy', value: 'easy' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Hard', value: 'hard' },
                      ]}
                    />
                  </FormControl>
                </Stack>
                <Stack mb={2} direction="row" spacing={1}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontSize: 13,
                        mb: 1,
                        color: colors.grey[800],
                      }}
                    >
                      Status
                    </FormLabel>
                    <SelectField
                      placeholder="Status"
                      onChange={(e) => {
                        formik.setFieldValue(
                          'status',
                          (e as { value: string }).value
                        )
                      }}
                      value={{
                        label: capitalize(formik.values.status),
                        value: formik.values.status,
                      }}
                      options={[
                        { label: 'Active', value: 'active' },
                        { label: 'In Active', value: 'inactive' },
                      ]}
                    />
                  </FormControl>
                  <CustomDatePicker
                    // label={'"month" and "year"'}
                    views={['day', 'month', 'year']}
                    labelDetail={{ text: 'Deadline', required: true }}
                    name="deadline"
                    onChange={(e) => {
                      if (!isEmpty(e)) {
                        formik.handleChange('deadline')(e.format('YYYY-MM-DD'))
                      }
                    }}
                    textFieldProps={{
                      value: moment(formik.values?.deadline),
                      onBlur: formik.handleBlur,
                      error:
                        formik.touched.deadline &&
                        Boolean(formik.errors.deadline),
                      helperText: formik.touched.deadline
                        ? formik.errors.deadline
                        : undefined,
                    }}
                  />
                </Stack>
                <TextareaField
                  placeholder="Enter bullet points of what students learn"
                  labelDetail={{ text: 'Learning Objectives', required: false }}
                  variant="outlined"
                  multiline
                  rows={3}
                  value={formik.values.objectives}
                  onChange={formik.handleChange}
                  name="objectives"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.objectives &&
                    Boolean(formik.errors.objectives)
                  }
                />
              </Box>

              {/* BUTTONS */}
              <Box p={2}>
                <Stack direction="row" justifyContent={'flex-end'} spacing={2}>
                  <ButtonComp
                    size="medium"
                    variant="text"
                    onClick={props.onClose}
                  >
                    Cancel
                  </ButtonComp>
                  <ButtonComp
                    type="submit"
                    startIcon={<IoAddOutline />}
                    size="medium"
                    disabled={createChapterLoading || !formik.dirty}
                  >
                    Save Chapter
                  </ButtonComp>
                </Stack>
              </Box>
            </Box>
          </form>
        </Box>
      </SpringModal>
    </Box>
  )
}
