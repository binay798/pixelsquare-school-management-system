import {
  Box,
  Card,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import { UploadAvatarComp } from '@src/pages/dashboard/components/uploadAvatarComp/uploadAvatar.component'
import { useFormik } from 'formik'
import { colors } from '@src/helpers/colors.helpers'
import { SelectField } from '@src/components/select/select.component'
import { capitalize, isEmpty } from 'lodash'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import moment from 'moment'
import { ButtonComp } from '@src/components/button/button.component'
import { createTeacherSchema } from './createTeacher.schema'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { useCallback, useEffect, useState } from 'react'
import { getDepartmentListAction } from '@src/store/redux/dashboard/teachers/departments/departments.slice'
import {
  changeTeacherProfilePicAction,
  createTeacherAction,
  editTeacherDetailAction,
} from '@src/store/redux/dashboard/teachers/teachers.slice'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { TUpdateTeacherDetailDto } from '@src/store/redux/dashboard/teachers/teachers.service'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'

export function CreateTeacherComp() {
  const { teacherId } = useParams()
  const dispatch = useDispatch()
  const [editMode, setEditMode] = useState(false)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const { data: teacherDetail } = useSelector(
    (store) => store.teachers.teacherDetail
  )
  const { data: departmentList, loading: departmentListLoading } = useSelector(
    (store) => store.departments.departmentList
  )
  const { loading: createTeacherLoading } = useSelector(
    (store) => store.teachers.createTeacher
  )
  const { loading: editTeacherLoading } = useSelector(
    (store) => store.teachers.editTeacher
  )
  const { loading: changeProfilePicLoading } = useSelector(
    (store) => store.teachers.changeProfilePic
  )

  useEffect(() => {
    if (!isEmpty(teacherDetail)) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [teacherDetail])

  useEffect(() => {
    dispatch(getDepartmentListAction({ payload: { page: 1, limit: 1000 } }))
  }, [])
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      firstname: teacherDetail?.user_profile_details?.firstname ?? '',
      middlename: teacherDetail?.user_profile_details?.middlename ?? '',
      lastname: teacherDetail?.user_profile_details?.lastname ?? '',
      mobile: teacherDetail?.user_profile_details?.mobile ?? '',
      temporary_address:
        teacherDetail?.user_profile_details?.temporary_address ?? '',
      permanent_address:
        teacherDetail?.user_profile_details?.permanent_address ?? '',
      religion: teacherDetail?.user_profile_details?.religion ?? '',
      blood_group: teacherDetail?.user_profile_details?.blood_group ?? '',
      date_of_birth: teacherDetail?.user_profile_details?.date_of_birth ?? '',
      gender: teacherDetail?.user_profile_details?.gender ?? '',
      nationality: teacherDetail?.user_profile_details?.nationality ?? '',
      email: teacherDetail?.user_details?.email ?? '',
      password: editMode ? '***' : '',
      department: {
        label: teacherDetail?.teacher_details?.school_department_id ?? '',
        value: teacherDetail?.teacher_details?.school_department_id ?? 0,
      },
      national_id: teacherDetail?.teacher_details?.national_id ?? '',
      joining_date: teacherDetail?.teacher_details?.joining_date ?? '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const {
        blood_group,
        date_of_birth,
        department,
        email,
        firstname,
        gender,
        joining_date,
        lastname,
        middlename,
        mobile,
        national_id,
        nationality,
        password,
        permanent_address,
        religion,
        temporary_address,
      } = values
      if (!editMode) {
        if (profilePic) {
          dispatch(
            createTeacherAction({
              body: {
                profilePic: profilePic,
                user_profile: {
                  firstname,
                  blood_group,
                  date_of_birth,
                  gender,
                  lastname,
                  mobile,
                  nationality,
                  permanent_address,
                  religion,
                  temporary_address,
                  middlename,
                },
                teacher_profile: {
                  joining_date,
                  national_id,
                  school_department_id: department.value,
                },
                user_credential: {
                  email,
                  password,
                },
              },
              onSuccess: () => {
                navigate('/dashboard/teachers')
              },
            })
          )
        } else {
          toast.error('Provide valid profile picture.')
        }
      } else {
        // EDIT TEACHER DETAILS
        const data: TUpdateTeacherDetailDto = {
          user_profile: {
            firstname,
            lastname,
            middlename,
            blood_group,
            date_of_birth,
            gender,
            mobile: String(mobile),
            nationality,
            permanent_address,
            religion,
            temporary_address,
          },
          teacher_profile: {
            joining_date,
            national_id,
            school_department_id: department.value,
          },
        }
        if (teacherId) {
          dispatch(
            editTeacherDetailAction({
              body: data,
              teacherId: Number(teacherId),
            })
          )
        }
      }
    },
    validationSchema: createTeacherSchema,
  })

  const remappedDepartmentList = useCallback(() => {
    return departmentList?.rows?.map((el) => ({ label: el.name, value: el.id }))
  }, [departmentList])

  const changeProfilePicHandler = (onClose?: () => void) => {
    if (profilePic && teacherDetail?.teacher_details?.id) {
      dispatch(
        changeTeacherProfilePicAction({
          image: profilePic,
          teacherId: teacherDetail?.teacher_details.id,
          onSuccess: () => {
            onClose?.()
          },
        })
      )
    }
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {editMode ? 'Edit' : 'Create'} Teacher
        </Typography>

        <Typography variant="body2" mt={1}>
          Update the school&apos;s details to keep records accurate and
          up-to-date.
        </Typography>
      </Box>
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
                    teacherDetail?.profile_photo_details?.path ?? ''
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
                  <InputField
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
                  />
                  <FormControl fullWidth required>
                    <FormLabel
                      sx={{
                        fontSize: 13,
                        mb: 1,
                        color: colors.grey[600],
                      }}
                    >
                      Department
                    </FormLabel>
                    <SelectField
                      placeholder={
                        departmentListLoading
                          ? 'Please wait...'
                          : 'Select department'
                      }
                      options={remappedDepartmentList() ?? []}
                      onChange={(e) => {
                        formik.setFieldValue('department', e)
                      }}
                      value={formik.values.department}
                    />
                  </FormControl>
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
                        formik.setFieldValue(
                          'gender',
                          (e as { value: string }).value
                        )
                      }}
                      value={{
                        label: capitalize(formik.values.gender),
                        value: formik.values.gender,
                      }}
                    />
                  </FormControl>
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
              <Stack spacing={2} direction="row">
                <CustomDatePicker
                  views={['day', 'month', 'year']}
                  labelDetail={{ text: 'Joining Date', required: true }}
                  name="joining_date"
                  onChange={(e) => {
                    if (!isEmpty(e)) {
                      formik.handleChange('joining_date')(
                        e.format('YYYY-MM-DD')
                      )
                    }
                  }}
                  textFieldProps={{
                    value: moment(formik.values?.joining_date),
                    onBlur: formik.handleBlur,
                    error:
                      formik.touched.joining_date &&
                      Boolean(formik.errors.joining_date),
                    helperText: formik.touched.joining_date
                      ? formik.errors.joining_date
                      : undefined,
                  }}
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
            </Stack>
          </FormBlock>

          <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={editTeacherLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createTeacherLoading}
                type="submit"
                size="medium"
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
