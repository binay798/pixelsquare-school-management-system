import {
  FormControl,
  FormControlProps,
  FormHelperText,
  OutlinedInput,
  OutlinedInputProps,
} from '@mui/material'

interface Props {
  inputProps?: OutlinedInputProps
  helperText?: string
  formControlProps?: FormControlProps
}
export function InputField(props: Props) {
  return (
    <FormControl {...props.formControlProps}>
      <OutlinedInput {...props.inputProps} />
      <FormHelperText error={props.inputProps?.error}>
        {props.helperText}
      </FormHelperText>
    </FormControl>
  )
}
