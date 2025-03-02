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
import { BsEye } from 'react-icons/bs'

interface Props extends OutlinedInputProps {
  helperText?: string
  formControlProps?: FormControlProps
  labelDetail?: {
    text: string
    required: boolean
  }
}
export function InputField(props: Props) {
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
        endAdornment={
          props.type === 'password' ? <BsEye /> : props.endAdornment
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
