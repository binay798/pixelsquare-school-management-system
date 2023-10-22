import { ThemeProvider, createTheme } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import responsiveFontSizes from '@mui/material/styles/responsiveFontSizes'
import { CssBaseline } from '@mui/material'

let theme = createTheme({
  palette: {},
  components: {
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
          border: `1px solid ${colors.grey[100]}`,
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)
interface Props {
  children?: React.ReactNode
}
export function MuiThemeProvider(props: Props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  )
}
