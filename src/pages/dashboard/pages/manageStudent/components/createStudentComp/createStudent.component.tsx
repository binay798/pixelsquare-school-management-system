import { Box, Card, FormControl, FormLabel, Stack } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { UploadAvatarComp } from '@src/pages/dashboard/components/uploadAvatarComp/uploadAvatar.component'
import { useFormik } from 'formik'
import { colors } from '@src/helpers/colors.helpers'
import { isEmpty } from 'lodash'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import moment from 'moment'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useCallback, useEffect, useState } from 'react'
import { getClassListAction } from '@src/store/redux/dashboard/academics/classes/classes.slice'
import {
  changeClassDetails,
  changeProfilePictureAction,
  createStudentAction,
  getStudentListAction,
  resetSelectedStudent,
  updateStudentAction,
} from '@src/store/redux/dashboard/manageStudents/manageStudents.slice'
import toast from 'react-hot-toast'
import { admitStudentSchema } from '../../pages/admitStudent/admitStudent.schema'
import { getClassSectionListAction } from '@src/store/redux/dashboard/academics/classSections/sections.slice'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { TCreateStudent } from '@src/store/redux/dashboard/manageStudents/manageStudents.service'
import { useNavigate } from 'react-router-dom'

export function CreateStudentComp() {
  const dispatch = useDispatch()
  const [editMode, setEditMode] = useState(false)
  const [profilePic, setProfilePic] = useState<File | null>(null)

  const navigate = useNavigate()
  const { data: classList, loading: classListLoading } = useSelector(
    (store) => store.classes.getClassList
  )
  const { data: classSectionList, loading: sectionListLoading } = useSelector(
    (store) => store.classSections.sectionList
  )
  const { loading: createLoading } = useSelector(
    (store) => store.manageStudents.students.create
  )
  const { data: selectedStudent } = useSelector(
    (store) => store.manageStudents.students.selectedStudent
  )
  const { loading: updateStudentLoading } = useSelector(
    (store) => store.manageStudents.students.update
  )
  const { loading: changeProfilePicLoading } = useSelector(
    (store) => store.manageStudents.students.changeProfilePicture
  )
  useEffect(() => {
    if (!isEmpty(selectedStudent)) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [selectedStudent])

  useEffect(() => {
    dispatch(getClassListAction({ onSuccess: () => {} }))
  }, [])

  const remappedClassList = useCallback(() => {
    return classList?.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el?.class_details?.id,
    }))
  }, [classList])

  const remappedClassSectionList = useCallback(() => {
    return classSectionList?.map((el) => ({
      label: el.section_details?.name,
      value: el.section_details?.id,
    }))
  }, [classSectionList])

  const formik = useFormik({
    initialValues: {
      firstname: selectedStudent?.user_profile_details?.firstname ?? '',
      middlename: selectedStudent?.user_profile_details?.middlename ?? '',
      lastname: selectedStudent?.user_profile_details?.lastname ?? '',
      mobile: selectedStudent?.user_profile_details?.mobile ?? '',
      temporary_address:
        selectedStudent?.user_profile_details?.temporary_address ?? '',
      permanent_address:
        selectedStudent?.user_profile_details?.permanent_address ?? '',
      religion: selectedStudent?.user_profile_details?.religion ?? '',
      blood_group: selectedStudent?.user_profile_details?.blood_group ?? '',
      date_of_birth: selectedStudent?.user_profile_details?.date_of_birth ?? '',
      gender: {
        label: selectedStudent?.user_profile_details?.gender ?? '',
        value: selectedStudent?.user_profile_details?.gender ?? '',
      },
      nationality: selectedStudent?.user_profile_details?.nationality ?? '',
      email: selectedStudent?.user_details?.email ?? '',
      password: editMode ? '***' : '',

      previousSchool: selectedStudent?.student_details?.previous_school ?? '',
      fatherName: selectedStudent?.student_details?.father_name ?? '',
      fatherMobile: selectedStudent?.student_details?.father_mobile ?? 0,
      motherName: selectedStudent?.student_details?.mother_name ?? '',
      motherMobile: selectedStudent?.student_details?.mother_mobile ?? 0,
      class: {
        label: selectedStudent?.class_details?.name ?? '',
        value: selectedStudent?.class_details?.id ?? 0,
      },
      section: {
        label: selectedStudent?.class_section_details?.name ?? '',
        value: selectedStudent?.class_section_details?.id ?? 0,
      },
      rollNo: selectedStudent?.student_academic_year_details?.roll_no ?? 0,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      // @ts-ignore
      const body: TCreateStudent = {
        user_credential: {
          email: values.email,
          password: values.password,
        },
        user_profile: {
          firstname: values.firstname,
          middlename: values.middlename,
          lastname: values.lastname,
          mobile: String(values.mobile),
          temporary_address: values.temporary_address,
          permanent_address: values.permanent_address,
          religion: values.religion,
          blood_group: values.blood_group,
          date_of_birth: values.date_of_birth,
          gender: values.gender.value,
          nationality: values.nationality,
        },
        student_profile: {
          previous_school: values.previousSchool,
          guardian_id: 1,
          father_name: values.fatherName,
          father_mobile: String(values.fatherMobile),
          mother_name: values.motherName,
          mother_mobile: String(values.motherMobile),
          roll_no: values.rollNo,
          class_id: values.class.value,
          class_section_id: values.section.value,
        },
      }
      if (!editMode) {
        if (profilePic) {
          // CREATE STUDENT
          dispatch(
            createStudentAction({
              payload: { ...body, image: profilePic },
              onSuccess: () => {},
            })
          )
        } else {
          toast.error('Provide valid profile picture.')
        }
      } else {
        // UPDATE STUDENT DETAILS
        if (selectedStudent?.student_details?.id) {
          dispatch(
            updateStudentAction({
              payload: {
                studentId: selectedStudent?.student_details?.id,
                body: {
                  student_profile: body.student_profile,
                  user_profile: body.user_profile,
                },
              },
              onSuccess: () => {
                formik.resetForm()
                dispatch(getStudentListAction({ payload: {} }))
                dispatch(resetSelectedStudent())
                navigate(`/dashboard/manage-students/students-list`)
              },
            })
          )
        }
      }
    },
    validationSchema: admitStudentSchema,
  })

  useEffect(() => {
    const classId = formik.values.class.value
    if (classId) {
      dispatch(
        getClassSectionListAction({
          payload: { classId: classId },
          onSuccess: () => {
            formik.resetForm()
          },
        })
      )
    }
  }, [formik.values.class.value])

  const changeProfilePicHandler = (onClose?: () => void) => {
    if (profilePic && selectedStudent?.student_details?.id) {
      dispatch(
        changeProfilePictureAction({
          payload: {
            image: profilePic,
            studentId: selectedStudent.student_details.id,
          },
          onSuccess: () => {
            onClose?.()
          },
        })
      )
    }
  }

  return (
    <Box>
      <Card sx={{ p: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <FormBlock title="Basic Information">
            <Box>
              <UploadAvatarComp
                onImageSelect={(file) => {
                  setProfilePic(file)
                }}
                editMode={{
                  imgUrl: getImageUrl(
                    selectedStudent?.asset_details?.path ?? ''
                  ),
                  onSave: (onClose) => {
                    changeProfilePicHandler(onClose)
                  },
                  saveBtnLoading: changeProfilePicLoading,
                }}
              />
              <Stack spacing={2}>
                <Stack spacing={2} direction="row">
                  <InputField
                    placeholder="Firtname"
                    labelDetail={{ text: 'Firstname', required: true }}
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    name="firstname"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.firstname &&
                      Boolean(formik.errors.firstname)
                    }
                    helperText={
                      formik.touched.firstname
                        ? formik.errors.firstname
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="Middlename"
                    labelDetail={{ text: 'Middlename', required: false }}
                    value={formik.values.middlename}
                    onChange={formik.handleChange}
                    name="middlename"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.middlename &&
                      Boolean(formik.errors.middlename)
                    }
                    helperText={
                      formik.touched.middlename
                        ? formik.errors.middlename
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="Lastname"
                    labelDetail={{ text: 'Lastname', required: true }}
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    name="lastname"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.lastname && Boolean(formik.errors.lastname)
                    }
                    helperText={
                      formik.touched.lastname
                        ? formik.errors.lastname
                        : undefined
                    }
                  />
                </Stack>
                <Stack spacing={2} direction="row">
                  {/* <InputField
                    placeholder="National ID"
                    labelDetail={{ text: 'National ID', required: true }}
                    value={formik.values.national_id}
                    onChange={formik.handleChange}
                    name="national_id"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.national_id &&
                      Boolean(formik.errors.national_id)
                    }
                    helperText={
                      formik.touched.national_id
                        ? formik.errors.national_id
                        : undefined
                    }
                  /> */}

                  <InputField
                    placeholder="Phone no."
                    labelDetail={{ text: 'Phone no.', required: true }}
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    name="mobile"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.mobile && Boolean(formik.errors.mobile)
                    }
                    helperText={
                      formik.touched.mobile ? formik.errors.mobile : undefined
                    }
                  />
                  <FormControl fullWidth required>
                    <FormLabel
                      sx={{
                        fontSize: 13,
                        mb: 1,
                        color: colors.grey[600],
                      }}
                    >
                      Gender
                    </FormLabel>
                    <SelectField
                      placeholder="Select gender"
                      options={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                        { label: 'Other', value: 'other' },
                      ]}
                      onChange={(e) => {
                        formik.setFieldValue('gender', e as { value: string })
                      }}
                      value={formik.values.gender}
                    />
                  </FormControl>
                </Stack>
                <Stack spacing={2} direction="row">
                  <InputField
                    placeholder="Blood group"
                    labelDetail={{ text: 'Blood Group', required: true }}
                    value={formik.values.blood_group}
                    onChange={formik.handleChange}
                    name="blood_group"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.blood_group &&
                      Boolean(formik.errors.blood_group)
                    }
                    helperText={
                      formik.touched.blood_group
                        ? formik.errors.blood_group
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="Religion"
                    labelDetail={{ text: 'Religion', required: true }}
                    value={formik.values.religion}
                    onChange={formik.handleChange}
                    name="religion"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.religion && Boolean(formik.errors.religion)
                    }
                    helperText={
                      formik.touched.religion
                        ? formik.errors.religion
                        : undefined
                    }
                  />
                </Stack>
                <Stack spacing={2} direction="row">
                  <InputField
                    placeholder="Nationality"
                    labelDetail={{ text: 'Nationality', required: true }}
                    value={formik.values.nationality}
                    onChange={formik.handleChange}
                    name="nationality"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.nationality &&
                      Boolean(formik.errors.nationality)
                    }
                    helperText={
                      formik.touched.nationality
                        ? formik.errors.nationality
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="Permanent Address"
                    labelDetail={{ text: 'Permanent Address', required: true }}
                    value={formik.values.permanent_address}
                    onChange={formik.handleChange}
                    name="permanent_address"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.permanent_address &&
                      Boolean(formik.errors.permanent_address)
                    }
                    helperText={
                      formik.touched.permanent_address
                        ? formik.errors.permanent_address
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="Temporary Address"
                    labelDetail={{ text: 'Temporary Address', required: true }}
                    value={formik.values.temporary_address}
                    onChange={formik.handleChange}
                    name="temporary_address"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.temporary_address &&
                      Boolean(formik.errors.temporary_address)
                    }
                    helperText={
                      formik.touched.temporary_address
                        ? formik.errors.temporary_address
                        : undefined
                    }
                  />
                </Stack>
              </Stack>
            </Box>
          </FormBlock>
          <FormBlock title="Academic Information">
            <Stack spacing={2}>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="School name"
                  labelDetail={{ text: 'Previous School', required: false }}
                  type="text"
                  // disabled={editMode}
                  value={formik.values.previousSchool}
                  onChange={formik.handleChange}
                  name="previousSchool"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.previousSchool &&
                    Boolean(formik.errors.previousSchool)
                  }
                  helperText={
                    formik.touched.previousSchool
                      ? formik.errors.previousSchool
                      : undefined
                  }
                />
                <InputField
                  placeholder="Father name"
                  labelDetail={{ text: 'Father name', required: true }}
                  type="text"
                  // disabled={editMode}
                  value={formik.values.fatherName}
                  onChange={formik.handleChange}
                  name="fatherName"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.fatherName &&
                    Boolean(formik.errors.fatherName)
                  }
                  helperText={
                    formik.touched.fatherName
                      ? formik.errors.fatherName
                      : undefined
                  }
                />
                <InputField
                  placeholder="Father mobile"
                  labelDetail={{ text: 'Father mobile', required: true }}
                  type="text"
                  // disabled={editMode}
                  value={formik.values.fatherMobile}
                  onChange={formik.handleChange}
                  name="fatherMobile"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.fatherMobile &&
                    Boolean(formik.errors.fatherMobile)
                  }
                  helperText={
                    formik.touched.fatherMobile
                      ? formik.errors.fatherMobile
                      : undefined
                  }
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Mother name"
                  labelDetail={{ text: 'Mother name', required: true }}
                  type="text"
                  // disabled={editMode}
                  value={formik.values.motherName}
                  onChange={formik.handleChange}
                  name="motherName"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.motherName &&
                    Boolean(formik.errors.motherName)
                  }
                  helperText={
                    formik.touched.motherName
                      ? formik.errors.motherName
                      : undefined
                  }
                />
                <InputField
                  placeholder="Mother mobile"
                  labelDetail={{ text: 'Mother mobile', required: false }}
                  type="text"
                  // disabled={editMode}
                  value={formik.values.motherMobile}
                  onChange={formik.handleChange}
                  name="motherMobile"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.motherMobile &&
                    Boolean(formik.errors.motherMobile)
                  }
                  helperText={
                    formik.touched.motherMobile
                      ? formik.errors.motherMobile
                      : undefined
                  }
                />
                {/* Class */}
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Class
                  </FormLabel>
                  <SelectField
                    placeholder={'Select class'}
                    options={remappedClassList() ?? []}
                    onChange={(e) => {
                      formik.setFieldValue('class', e)
                      dispatch(
                        changeClassDetails(
                          e as { label: string; value: number }
                        )
                      )
                    }}
                    value={formik.values.class}
                  />
                </FormControl>
              </Stack>
              <Stack spacing={2} direction="row">
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Class Section
                  </FormLabel>
                  <SelectField
                    placeholder={'Select class section'}
                    options={remappedClassSectionList() ?? []}
                    onChange={(e) => {
                      formik.setFieldValue('section', e)
                    }}
                    isDisabled={
                      isEmpty(formik.values.class.label) ||
                      classListLoading ||
                      sectionListLoading
                    }
                    value={formik.values.section}
                  />
                </FormControl>
                <InputField
                  placeholder="Roll no."
                  labelDetail={{ text: 'Roll number', required: true }}
                  type="number"
                  // disabled={editMode}
                  value={formik.values.rollNo}
                  onChange={formik.handleChange}
                  name="rollNo"
                  onBlur={formik.handleBlur}
                  error={formik.touched.rollNo && Boolean(formik.errors.rollNo)}
                  helperText={
                    formik.touched.rollNo ? formik.errors.rollNo : undefined
                  }
                />
                <CustomDatePicker
                  // label={'"month" and "year"'}
                  views={['day', 'month', 'year']}
                  labelDetail={{ text: 'Date of Birth', required: true }}
                  name="date_of_birth"
                  onChange={(e) => {
                    if (!isEmpty(e)) {
                      formik.handleChange('date_of_birth')(
                        e.format('YYYY-MM-DD')
                      )
                    }
                  }}
                  textFieldProps={{
                    value: moment(formik.values?.date_of_birth),
                    onBlur: formik.handleBlur,
                    error:
                      formik.touched.date_of_birth &&
                      Boolean(formik.errors.date_of_birth),
                    helperText: formik.touched.date_of_birth
                      ? formik.errors.date_of_birth
                      : undefined,
                  }}
                />
              </Stack>
              <Stack spacing={2} direction="row">
                <InputField
                  placeholder="Email Address"
                  labelDetail={{ text: 'Email Address', required: true }}
                  type="email"
                  disabled={editMode}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  name="email"
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    formik.touched.email ? formik.errors.email : undefined
                  }
                />
                <InputField
                  placeholder="Password"
                  labelDetail={{ text: 'Password', required: true }}
                  type="password"
                  disabled={editMode}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  name="password"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={
                    formik.touched.password ? formik.errors.password : undefined
                  }
                />
              </Stack>
              <Stack spacing={2} direction="row"></Stack>
            </Stack>
          </FormBlock>

          <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={updateStudentLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty || !formik.isValid}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty || !formik.isValid}
              >
                Create
              </ButtonComp>
            )}
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
