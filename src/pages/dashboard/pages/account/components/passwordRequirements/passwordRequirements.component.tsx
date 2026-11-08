import { Stack, Typography } from '@mui/material'
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io'
import { colors } from '@src/helpers/colors.helpers'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../changePasswordForm/changePasswordForm.schema'

interface Props {
  value: string
}

const PASSWORD_RULES: { label: string; isValid: (value: string) => boolean }[] =
  [
    {
      label: `${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
      isValid: (value) =>
        value.length >= PASSWORD_MIN_LENGTH &&
        value.length <= PASSWORD_MAX_LENGTH,
    },
    {
      label: 'At least one letter',
      isValid: (value) => /[a-zA-Z]/.test(value),
    },
    {
      label: 'At least one number',
      isValid: (value) => /[0-9]/.test(value),
    },
  ]

/**
 * Live checklist of the password policy, so the rules are visible before the
 * form is submitted (the form schema refuses the same cases).
 */
export function PasswordRequirements(props: Props) {
  return (
    <Stack
      direction={'row'}
      flexWrap={'wrap'}
      columnGap={2}
      rowGap={0.5}
      mt={1}
    >
      {PASSWORD_RULES.map((rule) => {
        const isValid = rule.isValid(props.value)

        return (
          <Stack
            key={rule.label}
            direction={'row'}
            alignItems={'center'}
            spacing={0.5}
          >
            {isValid ? (
              <IoIosCheckmarkCircle size={14} color={colors.green[600]} />
            ) : (
              <IoIosCloseCircle size={14} color={colors.grey[400]} />
            )}
            <Typography
              variant="caption"
              color={isValid ? colors.green[700] : 'text.secondary'}
            >
              {rule.label}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}
