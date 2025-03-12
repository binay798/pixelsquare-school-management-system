import {
  Box,
  Card,
  CircularProgress,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { FormBlock } from '@src/components/formBlock/formBlock.component'
import { InputField } from '@src/components/input/input.component'
import {
  AsyncSelectField,
  SelectField,
} from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'

import { UploadAvatarComp } from '@src/pages/dashboard/components/uploadAvatarComp/uploadAvatar.component'
import { useFormik } from 'formik'
import { editEmployeeSchema } from './edit.schema'
import { capitalize, isEmpty } from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { listDesignations } from '@src/store/redux/dashboard/humanResources/designations/designations.service'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  changeEmployeeProfileAction,
  getEmployeeDetailsAction,
  updateEmployeeDetailAction,
} from '@src/store/redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'
import { EMPLOYEE_ROLE } from '@src/constants/users.constants'
import { useNavigate, useParams } from 'react-router-dom'
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'

export function EditEmployeePage() {
  const { employeeId } = useParams()
  const dispatch = useDispatch()
  const { loading: fetchLoading, data: selectedEmployee } = useSelector(
    (store) => store.employees.selectedEmployee
  )
  const { loading: changeProfilePicLoading } = useSelector(
    (store) => store.employees.changeProfilePic
  )
  const { loading: updateLoading } = useSelector(
    (store) => store.employees.updateEmployee
  )
  const navigate = useNavigate()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const formik = useFormik({
    initialValues: {
      firstname: selectedEmployee?.user_profile_details?.firstname,
      middlename: selectedEmployee?.user_profile_details?.middlename,
      lastname: selectedEmployee?.user_profile_details?.lastname,
      mobile: selectedEmployee?.user_profile_details?.mobile,
      temporary_address:
        selectedEmployee?.user_profile_details?.temporary_address,
      permanent_address:
        selectedEmployee?.user_profile_details?.permanent_address,
      religion: selectedEmployee?.user_profile_details?.religion,
      blood_group: selectedEmployee?.user_profile_details?.blood_group,
      date_of_birth: selectedEmployee?.user_profile_details?.date_of_birth,
      gender: selectedEmployee?.user_profile_details?.gender,
      nationality: selectedEmployee?.user_profile_details?.nationality,
      employee_designation_id: {
        label: selectedEmployee?.designation_details?.designation,
        value: selectedEmployee?.designation_details?.id,
      },
      national_id: selectedEmployee?.employee_details?.national_id,
      joining_date: selectedEmployee?.employee_details?.joining_date,
      role: selectedEmployee?.user_roles?.[0]?.role,
    },
    onSubmit: (values) => {
      dispatch(
        updateEmployeeDetailAction({
          payload: {
            employeeId: Number(employeeId),
            data: {
              user_profile: {
                firstname: values.firstname,
                middlename: values.middlename,
                blood_group: values.blood_group,
                date_of_birth: values.date_of_birth,
                lastname: values.lastname,
                gender: values.gender,
                mobile: String(values.mobile),
                nationality: values.nationality,
                permanent_address: values.permanent_address,
                temporary_address: values.temporary_address,
                religion: values.religion,
              },
              employee_profile: {
                employee_designation_id: Number(
                  values.employee_designation_id.value
                ),
                joining_date: values.joining_date,
                national_id: values.national_id,
                role: values.role,
              },
            },
          },
          onSuccess: () => {
            navigate('/dashboard/human-resources/manage-employee')
          },
        })
      )
    },
    validationSchema: editEmployeeSchema,
    enableReinitialize: true,
  })

  const loadDesignations = () => {
    return listDesignations(1, 100).then(
      (res) =>
        res.data?.rows?.map((el) => ({ label: el.designation, value: el.id }))
    )
  }

  useEffect(() => {
    dispatch(
      getEmployeeDetailsAction({ payload: { employeeId: Number(employeeId) } })
    )
  }, [employeeId])

  const changeProfilePicHandler = (onClose?: () => void) => {
    if (profilePic) {
      dispatch(
        changeEmployeeProfileAction({
          payload: { employeeId: Number(employeeId), file: profilePic },
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
        <Box>
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              Edit Employee
            </Typography>
            {fetchLoading ? (
              <CircularProgress color="secondary" size={18} />
            ) : null}
          </Stack>
          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
      </Box>
      <Card sx={{ p: 2 }}>
        <UploadAvatarComp
          onImageSelect={(file) => {
            setProfilePic(file)
          }}
          editMode={{
            imgUrl: getImageUrl(
              selectedEmployee?.profile_pic_details?.path ?? ''
            ),
            onSave: (onClose) => {
              changeProfilePicHandler(onClose)
            },
            saveBtnLoading: changeProfilePicLoading,
          }}
        />
        <form onSubmit={formik.handleSubmit}>
          <FormBlock title="Basic Information">
            <Box>
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
                      Designation
                    </FormLabel>
                    <AsyncSelectField
                      placeholder="Select employee designation"
                      // defaultOptions={[
                      //   { label: 'Accountant', value: 'Accountant' },
                      //   { label: 'Receptionist', value: 'Receptionist' },
                      //   { label: 'Librarian', value: 'librarian' },
                      // ]}
                      defaultOptions
                      loadOptions={() =>
                        new Promise((resolve) => {
                          loadDesignations().then((res) => {
                            resolve(res)
                          })
                        })
                      }
                      onChange={(e) => {
                        formik.setFieldValue('employee_designation_id', e)
                      }}
                      // defaultValue={formik.values.school_type}

                      value={formik.values.employee_designation_id}
                    />
                    {/* <SelectField
                      placeholder="Select employee designation"
                      options={[
                        { label: 'Accountant', value: 'Accountant' },
                        { label: 'Receptionist', value: 'Receptionist' },
                        { label: 'Librarian', value: 'librarian' },
                      ]}
                      onChange={(e) => {
                        formik.setFieldValue(
                          'employee_designation_id',
                          (e as { value: string }).value
                        )
                      }}
                      // defaultValue={formik.values.school_type}

                      value={{
                        label: capitalize(
                          formik.values.employee_designation_id
                        ),
                        value: formik.values.employee_designation_id,
                      }}
                    /> */}
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
                      // defaultValue={formik.values.school_type}

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
                {/* <InputField
                  placeholder="Email Address"
                  labelDetail={{ text: 'Email Address', required: true }}
                  type="email"
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
                /> */}
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
                    Role
                  </FormLabel>
                  <SelectField
                    placeholder="Select role"
                    options={EMPLOYEE_ROLE.map((el) => ({
                      label: capitalize(el),
                      value: el,
                    }))}
                    onChange={(e) => {
                      formik.setFieldValue(
                        'role',
                        (e as { value: string }).value
                      )
                    }}
                    // defaultValue={formik.values.school_type}

                    value={{
                      label: capitalize(formik.values.role),
                      value: formik.values.role,
                    }}
                  />
                </FormControl>
                <CustomDatePicker
                  // label={'"month" and "year"'}
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
            <ButtonComp
              loading={updateLoading}
              type="submit"
              size="medium"
              disabled={!formik.dirty}
            >
              Update
            </ButtonComp>
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
