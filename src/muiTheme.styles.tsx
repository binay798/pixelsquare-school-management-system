import { ThemeProvider, createTheme } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import responsiveFontSizes from '@mui/material/styles/responsiveFontSizes'
import { CssBaseline } from '@mui/material'
import { alpha } from '@mui/system'

let theme = createTheme({
  shape: {
    borderRadius: 6,
  },
  palette: {
    mode: 'light',
    primary: {
      light: '#2463eb',
      main: '#2463eb',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff5983',
      main: '#f50057',
      dark: '#bb002f',
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    success: {
      light: '#17a34a',
      main: '#17a34a',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },

    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: '#fafafa',
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
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

theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          // Remove the box shadow in all states
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:active': {
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: 'none',
          },
          textTransform: 'none',
        },
        containedPrimary: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.primary.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
        containedSecondary: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
        containedError: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.error.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
        containedInfo: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.info.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
        containedSuccess: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.success.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
        containedWarning: {
          '&.Mui-disabled': {
            backgroundColor: alpha(theme.palette.warning.main, 0.6),
            color: alpha('#fff', 0.9),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          // Custom box shadow for the Menu's paper component
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          // You can also adjust the border radius if needed
          borderRadius: 8,
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: 'body2',
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
})

const modifiedTheme = responsiveFontSizes(theme)
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
