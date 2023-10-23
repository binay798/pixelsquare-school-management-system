import {
  FormControl,
  FormControlProps,
  FormHelperText,
  OutlinedInput,
  OutlinedInputProps,
} from '@mui/material'
import { omit } from 'lodash'

interface Props extends OutlinedInputProps {
  helperText?: string
  formControlProps?: FormControlProps
}
export function InputField(props: Props) {
  return (
    <FormControl {...props.formControlProps}>
      <OutlinedInput
        {...omit(props, 'helperText', 'formControlProps')}
        notched={false}
      />
      <FormHelperText error={props.error}>{props.helperText}</FormHelperText>
    </FormControl>
  )
}
