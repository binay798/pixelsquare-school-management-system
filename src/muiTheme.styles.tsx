import { ThemeProvider, createTheme } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import responsiveFontSizes from '@mui/material/styles/responsiveFontSizes'
import { CssBaseline } from '@mui/material'
import { alpha } from '@mui/system'

let theme = createTheme({
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
          // borderRadius: 6,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        style: {
          boxShadow: 'none',
          textTransform: 'capitalize',
          // borderRadius: 6,
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
          // borderRadius: 8,
          boxShadow:
            'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
          border: `1px solid`,
        },
      },
    },
  },
})

theme = createTheme({
  shape: {
    borderRadius: 7,
  },
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
          // borderRadius: '0.4rem',
          transition: '0.3s ease',
          '&:hover': {
            boxShadow: 'none',
            opacity: 0.9,
          },
          '&:active': {
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: 'none',
          },
          textTransform: 'none',
        },
        disabled: {
          cursor: 'not-allowed',
        },
        textSecondary: {
          color: '#333',
        },
        containedPrimary: {
          background: 'linear-gradient(to bottom, #5f54fd 30%, #5038f6 90%)',
          color: '#fff',
          '&.Mui-disabled': {
            // background: alpha(theme.palette.primary.main, 0.6),
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },
        containedSecondary: {
          background: 'linear-gradient(to bottom, #333 30%, #222 90%)',
          color: '#fff',
          '&.Mui-disabled': {
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },
        containedError: {
          background: 'linear-gradient(to bottom, #f44336 30%, #d03429 90%)',
          color: '#fff',
          '&.Mui-disabled': {
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },
        containedInfo: {
          background: 'linear-gradient(to bottom, #2196f3 30%, #1b81d5 90%)',
          '&.Mui-disabled': {
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },
        containedSuccess: {
          background: 'linear-gradient(to bottom, #27ef2e 30%, #1cdf22 90%)',
          color: '#fff',
          '&.Mui-disabled': {
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },
        containedWarning: {
          background: 'linear-gradient(to bottom, #ff9800 30%, #e58c06 90%)',
          color: '#fff',
          '&.Mui-disabled': {
            opacity: 0.7,
            color: alpha('#fff', 0.9),
          },
        },

        textPrimary: {
          color: '#333',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          margin: '0px 8px',
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      },
      styleOverrides: {
        root: {
          marginTop: 10,
        },
        paper: {
          // Custom box shadow for the Menu's paper component
          boxShadow:
            'rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
          // You can also adjust the border radius if needed
          // borderRadius: 8,
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
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            'rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d3d3d3', // Purple border on focus
            borderWidth: 1,
          },
          transition: 'border-color 0.3s ease, outline 0.1s ease', // Smooth transition for hover and focus
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d3d3d3', // Slightly lighter purple on hover
          },
          '&.Mui-focused': {
            outline: '2px solid #8142f5', // Outline when focused (light purple)
            outlineOffset: '2px', // Separate the outline from the border
          },
        },
        notchedOutline: {
          borderColor: '#d3d3d3', // Default border color
        },
        input: {
          padding: '10px 10px',
          color: '#555',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#6a60eb',
          height: 4,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        },
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
