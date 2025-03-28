import {
  Box,
  Card,
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
import { createEmployeeSchema } from './create.schema'
import { capitalize, isEmpty } from 'lodash'
import moment from 'moment'
import { useState } from 'react'
import { listDesignations } from '@src/store/redux/dashboard/humanResources/designations/designations.service'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { createEmployeeAction } from '@src/store/redux/dashboard/humanResources/manageEmployee/manageEmployee.slice'
import { EMPLOYEE_ROLE } from '@src/constants/users.constants'
import { useNavigate } from 'react-router-dom'

export function CreateEmployeePage() {
  const dispatch = useDispatch()
  const { loading: createEmployeeLoading } = useSelector(
    (store) => store.employees.createEmployee
  )
  const navigate = useNavigate()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const formik = useFormik({
    initialValues: {
      firstname: '',
      middlename: '',
      lastname: '',
      mobile: '',
      temporary_address: '',
      permanent_address: '',
      religion: '',
      blood_group: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      email: '',
      password: '',
      employee_designation_id: { label: '', value: '' },
      national_id: '',
      joining_date: '',
      role: '',
    },
    onSubmit: (values) => {
      if (profilePic) {
        dispatch(
          createEmployeeAction({
            payload: {
              employee_profile: {
                employee_designation_id: Number(
                  values.employee_designation_id.value
                ),
                joining_date: values.joining_date,
                national_id: values.national_id,
                role: values.role,
              },
              image: profilePic,
              user_credential: {
                email: values.email,
                password: values.password,
              },
              user_profile: {
                blood_group: values.blood_group,
                date_of_birth: values.date_of_birth,
                firstname: values.firstname,
                middlename: values.middlename,
                lastname: values.lastname,
                gender: values.gender,
                mobile: values.mobile,
                nationality: values.nationality,
                permanent_address: values.permanent_address,
                temporary_address: values.temporary_address,
                religion: values.religion,
              },
            },
            onSuccess: () => {
              formik.resetForm()
              navigate('/dashboard/human-resources/manage-employee')
            },
          })
        )
      }
    },
    validationSchema: createEmployeeSchema,
  })

  const loadDesignations = () => {
    return listDesignations(1, 100).then(
      (res) =>
        res.data?.rows?.map((el) => ({ label: el.designation, value: el.id }))
    )
  }

  return (
    <Box>
      <Box mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Create Employee
          </Typography>
          <Typography variant="body2" mt={1}>
            Update the school&apos;s details to keep records accurate and
            up-to-date.
          </Typography>
        </Box>
      </Box>
      <Card sx={{ p: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <FormBlock title="Basic Information">
            <Box>
              <UploadAvatarComp
                onImageSelect={(file) => {
                  setProfilePic(file)
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
                <InputField
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
                />
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
              </Stack>
              <Stack spacing={2} direction="row">
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
              loading={createEmployeeLoading}
              type="submit"
              size="medium"
            >
              Create
            </ButtonComp>
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
