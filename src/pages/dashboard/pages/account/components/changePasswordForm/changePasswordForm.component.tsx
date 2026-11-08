import { Alert, Box, Card, Divider, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { useFormik } from 'formik'
import { MdOutlineLock } from 'react-icons/md'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { updatePasswordAction } from '@src/store/redux/dashboard/account/password/password.slice'
import { CHANGE_PASSWORD_SCHEMA } from './changePasswordForm.schema'
import { PasswordRequirements } from '../passwordRequirements/passwordRequirements.component'

const INITIAL_VALUES = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

/**
 * Change password section of the account page.
 *
 * Only `currentPassword` and `newPassword` are sent to the API: the
 * confirmation field is a client side guard and never leaves the browser.
 */
export function ChangePasswordForm() {
  const dispatch = useDispatch()
  const { loading } = useSelector(
    (store) => store.accountPassword.updatePassword
  )
  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    onSubmit: (values) => {
      dispatch(
        updatePasswordAction({
          payload: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
          onSuccess: () => {
            formik.resetForm()
          },
        })
      )
    },
    validationSchema: CHANGE_PASSWORD_SCHEMA,
    enableReinitialize: true,
  })

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} mb={2.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.blue[50],
            color: 'primary.main',
          }}
        >
          <MdOutlineLock size={20} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Change Password
          </Typography>
          <Typography variant="body2">
            Confirm your current password and choose a new one.
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <Box maxWidth={560}>
          <Stack spacing={2}>
            <InputField
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              labelDetail={{ required: true, text: 'Current password' }}
              name="currentPassword"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.currentPassword &&
                Boolean(formik.errors.currentPassword)
              }
              helperText={
                formik.touched.currentPassword
                  ? formik.errors.currentPassword
                  : undefined
              }
            />

            <Box>
              <InputField
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                labelDetail={{ required: true, text: 'New password' }}
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.newPassword &&
                  Boolean(formik.errors.newPassword)
                }
                helperText={
                  formik.touched.newPassword
                    ? formik.errors.newPassword
                    : undefined
                }
              />
              <PasswordRequirements value={formik.values.newPassword} />
            </Box>

            <InputField
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              labelDetail={{ required: true, text: 'Confirm new password' }}
              name="confirmNewPassword"
              value={formik.values.confirmNewPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmNewPassword &&
                Boolean(formik.errors.confirmNewPassword)
              }
              helperText={
                formik.touched.confirmNewPassword
                  ? formik.errors.confirmNewPassword
                  : undefined
              }
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              You stay signed in on this device. Use the new password the next
              time you sign in.
            </Alert>

            <Stack
              direction={'row'}
              spacing={2}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <ButtonComp
                variant="text"
                size="medium"
                disabled={loading}
                onClick={() => formik.resetForm()}
              >
                Clear
              </ButtonComp>
              <ButtonComp type="submit" size="medium" loading={loading}>
                Update password
              </ButtonComp>
            </Stack>
          </Stack>
        </Box>
      </form>
    </Card>
  )
}
