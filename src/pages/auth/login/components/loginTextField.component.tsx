import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
} from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { FieldLabel, LabelRow } from '../login.styles'

interface LoginTextFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>
  startIcon: ReactNode
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  autoFocus?: boolean
  error?: string
  hint?: ReactNode
  labelAction?: ReactNode
  endAdornment?: ReactNode
}

/**
 * Single source of truth for the two sign-in inputs.
 * Keeps the focus ring, error styling and helper text identical across fields
 * and exposes every accessibility hook the browser needs.
 */
export function LoginTextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  onKeyUp,
  startIcon,
  type = 'text',
  placeholder,
  autoComplete,
  autoFocus,
  error,
  hint,
  labelAction,
  endAdornment,
}: LoginTextFieldProps) {
  const helperId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <FormControl fullWidth error={Boolean(error)}>
      <LabelRow>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {labelAction}
      </LabelRow>
      <OutlinedInput
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={onChange}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        notched={false}
        aria-invalid={Boolean(error)}
        aria-describedby={helperId}
        startAdornment={
          <InputAdornment
            position="start"
            sx={{ pl: 0.75, color: error ? colors.red[400] : colors.grey[400] }}
          >
            {startIcon}
          </InputAdornment>
        }
        endAdornment={
          endAdornment ? (
            <InputAdornment position="end" sx={{ pr: 0.5 }}>
              {endAdornment}
            </InputAdornment>
          ) : undefined
        }
        sx={{
          height: 46,
          borderRadius: '12px',
          bgcolor: '#fff',
          fontSize: 13.5,
          transition: 'box-shadow 0.18s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f2',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused': {
            outline: 'none',
            boxShadow: '0 0 0 4px rgba(36, 99, 235, 0.10)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2463eb',
            borderWidth: '1.5px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.red[400],
          },
          '&.Mui-error.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.10)',
          },
          '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.red[400],
            borderWidth: '1.5px',
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 0',
            fontSize: 13.5,
            color: colors.grey[900],
          },
          '& input::placeholder': {
            color: '#7c8798',
            opacity: 1,
          },
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #fff inset',
            WebkitTextFillColor: '#111827',
            caretColor: '#111827',
            transition: 'background-color 9999s ease-out 0s',
          },
        }}
      />
      {error ? (
        <FormHelperText
          id={`${id}-error`}
          error
          role="alert"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            mx: 0,
            mt: 0.75,
            fontSize: 11.5,
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={12} />
          {error}
        </FormHelperText>
      ) : hint ? (
        <Typography
          id={`${id}-hint`}
          component="div"
          sx={{ mt: 0.75, fontSize: 11.5, lineHeight: 1.4, color: '#6b7686' }}
        >
          {hint}
        </Typography>
      ) : null}
    </FormControl>
  )
}

type PasswordFieldProps = Omit<
  LoginTextFieldProps,
  'type' | 'endAdornment' | 'startIcon'
> & {
  startIcon: ReactNode
}

/** Password input with an accessible show/hide toggle. */
export function LoginPasswordField({
  startIcon,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <LoginTextField
      {...props}
      startIcon={startIcon}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <IconButton
          type="button"
          size="small"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          sx={{
            color: colors.grey[400],
            '&:hover': { color: colors.grey[700], bgcolor: 'transparent' },
            '&:focus-visible': {
              outline: '2px solid #2463eb',
              outlineOffset: 2,
            },
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </IconButton>
      }
    />
  )
}
