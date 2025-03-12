import {
  FormControl,
  FormControlProps,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  OutlinedInputProps,
  OutlinedTextFieldProps,
  TextField,
} from '@mui/material'
import { omit } from 'lodash'
import { colors } from '@src/helpers/colors.helpers'
import { TfiEye } from 'react-icons/tfi'
import { RxEyeClosed } from 'react-icons/rx'
import { useState } from 'react'

interface Props extends OutlinedInputProps {
  helperText?: string
  formControlProps?: FormControlProps
  labelDetail?: {
    text: string
    required: boolean
  }
}
export function InputField(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormControl
      {...props.formControlProps}
      fullWidth
      required={props?.labelDetail?.required ?? false}
    >
      {props?.labelDetail ? (
        <FormLabel
          sx={{
            fontSize: 13,
            mb: 1,
            color: props?.error ? 'red' : colors.grey[800],
          }}
        >
          {props.labelDetail?.text}
        </FormLabel>
      ) : (
        ''
      )}
      <OutlinedInput
        {...omit(props, 'helperText', 'formControlProps', 'labelDetail')}
        notched={false}
        type={
          props.type === 'password'
            ? showPassword
              ? 'text'
              : 'password'
            : props.type
        }
        endAdornment={
          props.type === 'password' ? (
            showPassword ? (
              <TfiEye
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPassword(false)}
                size={20}
                color={colors.grey[500]}
              />
            ) : (
              <RxEyeClosed
                style={{ cursor: 'pointer' }}
                size={20}
                color={colors.grey[500]}
                onClick={() => setShowPassword(true)}
              />
            )
          ) : (
            props.endAdornment
          )
        }
      />
      <FormHelperText error={props.error}>{props.helperText}</FormHelperText>
    </FormControl>
  )
}

interface TextareaProp extends OutlinedTextFieldProps {
  labelDetail?: {
    text: string
    required: boolean
  }
  helperText?: string
}
export function TextareaField(props: TextareaProp) {
  return (
    <FormControl fullWidth required={props?.labelDetail?.required ?? false}>
      {props?.labelDetail ? (
        <FormLabel
          sx={{
            fontSize: 13,
            mb: 1,
            color: colors.grey[800],
          }}
        >
          {props.labelDetail?.text}
        </FormLabel>
      ) : (
        ''
      )}
      <TextField
        {...omit(props, 'labelDetail', 'helperText')}
        sx={{
          '.MuiInputBase-root': {
            padding: 1,
          },
        }}
      />
      <FormHelperText error={props.error}>{props.helperText}</FormHelperText>
    </FormControl>
  )
}
