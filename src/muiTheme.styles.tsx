import { ThemeProvider, createTheme } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import responsiveFontSizes from '@mui/material/styles/responsiveFontSizes'
import { CssBaseline } from '@mui/material'
import { alpha } from '@mui/system'

const theme = (mode: 'dark' | 'light') =>
  createTheme({
    palette: {
      mode,

      text: {
        primary: '',
      },
      secondary: {
        main: '#0000ff',
        light: '#0000ff',
        dark: '#3cb371',
      },
      background: {
        paper: mode === 'dark' ? 'red' : 'white',
      },
    },
    components: {
      MuiOutlinedInput: {
        defaultProps: {
          size: 'small',
          margin: 'dense',
        },
        styleOverrides: {
          root: {
            fontSize: 14,
            background: alpha(colors.grey[100], 0.7),
            color: colors.grey[700],
            borderRadius: 6,
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
          style: {
            boxShadow: 'none',
            textTransform: 'capitalize',
            borderRadius: 6,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          size: 'small',
          variant: 'contained',
        },
      },
      MuiTypography: {
        defaultProps: {
          variant: 'body2',
          color: colors.grey[900],
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow:
              'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
            border: `1px solid`,
          },
        },
      },
    },
  })

const modifiedTheme = responsiveFontSizes(theme('light'))
interface Props {
  children?: React.ReactNode
}
export function MuiThemeProvider(props: Props) {
  return (
    <ThemeProvider theme={modifiedTheme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  )
}
