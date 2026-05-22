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
import { getImageUrl } from '@src/helpers/getImageUrl.helpers'
import { UploadAvatarComp } from '@src/pages/dashboard/components/uploadAvatarComp/uploadAvatar.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  changeGuardianProfilePic,
  createGuardianAction,
  getGuardianDetailsAction,
  updateGuardianAction,
} from '@src/store/redux/dashboard/guardian/guardian.slice'
import { useFormik } from 'formik'
import { capitalize, isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { colors } from '@src/helpers/colors.helpers'
import { SelectField } from '@src/components/select/select.component'
import { createGuardianSchema } from './createGuardian.schema'
import { ButtonComp } from '@src/components/button/button.component'
import { TCreateGuardianDto } from '@src/store/redux/dashboard/guardian/guardian.service'

export function CreateGuardianComp() {
  const { guardianId } = useParams()
  const dispatch = useDispatch()
  const [editMode, setEditMode] = useState(false)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const { data: guardianDetails } = useSelector(
    (store) => store.guardians.guardianDetail
  )
  const { loading: createGuardianLoading } = useSelector(
    (store) => store.guardians.create
  )
  const { loading: editGuardianLoading } = useSelector(
    (store) => store.guardians.edit
  )
  const { loading: changeProfilePicLoading } = useSelector(
    (store) => store.guardians.changeProfilePic
  )

  useEffect(() => {
    if (!isEmpty(guardianDetails)) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [guardianDetails])

  useEffect(() => {
    if (!isEmpty(guardianId)) {
      dispatch(getGuardianDetailsAction({ guardianId: Number(guardianId) }))
    }
  }, [guardianId])

  // useEffect(() => {
  //   dispatch(getDepartmentListAction({ payload: { page: 1, limit: 1000 } }))
  // }, [])
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      firstname: guardianDetails?.user_profile_details?.firstname ?? '',
      middlename: guardianDetails?.user_profile_details?.middlename ?? '',
      lastname: guardianDetails?.user_profile_details?.lastname ?? '',
      mobile: String(guardianDetails?.user_profile_details?.mobile) ?? '',
      temporary_address:
        guardianDetails?.user_profile_details?.temporary_address ?? '',
      permanent_address:
        guardianDetails?.user_profile_details?.permanent_address ?? '',
      religion: guardianDetails?.user_profile_details?.religion ?? '',
      blood_group: guardianDetails?.user_profile_details?.blood_group ?? '',
      date_of_birth: guardianDetails?.user_profile_details?.date_of_birth ?? '',
      gender: guardianDetails?.user_profile_details?.gender ?? '',
      nationality: guardianDetails?.user_profile_details?.nationality ?? '',
      email: guardianDetails?.user_details?.email ?? '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const {
        blood_group,
        date_of_birth,
        email,
        firstname,
        gender,
        lastname,
        middlename,
        mobile,
        nationality,
        permanent_address,
        religion,
        temporary_address,
      } = values
      if (!editMode) {
        if (profilePic) {
          dispatch(
            createGuardianAction({
              payload: {
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
                user_credential: {
                  email,
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
        // EDIT GUARDIAN DETAILS
        const data: TCreateGuardianDto['user_profile'] = {
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
        }
        if (guardianId) {
          dispatch(
            updateGuardianAction({
              payload: data,
              guardianId: Number(guardianId),
            })
          )
        }
      }
    },
    validationSchema: createGuardianSchema,
  })

  const changeProfilePicHandler = (onClose?: () => void) => {
    if (profilePic && guardianDetails?.guardian_details?.id) {
      dispatch(
        changeGuardianProfilePic({
          image: profilePic,
          guardianId: guardianDetails?.guardian_details.id,
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
          {editMode ? 'Edit' : 'Create'} Guardian
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
                    guardianDetails?.asset_details?.path ?? ''
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
              </Stack>
            </Stack>
          </FormBlock>

          <Stack direction={'row'} justifyContent={'flex-end'} spacing={2}>
            <ButtonComp size="medium" variant="text">
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                loading={editGuardianLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                loading={createGuardianLoading}
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
