import Select, {
  StylesConfig,
  ThemeConfig,
  Props as ReactSelectProps,
  GroupBase,
} from 'react-select'
import AsyncSelect, { AsyncProps } from 'react-select/async'

// Custom styles for the react-select component.
export const customReactSelectStyles: StylesConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999, // Increase this to a higher value if needed
  }),
  control: (provided, state) => ({
    ...provided,
    border: '1px solid #ddd',

    // boxShadow: state.isFocused ? '0 0 0 1px #007BFF' : 'none',
    // transition: 'all 0.2s ease',
    boxShadow: 'unset',
    fontSize: 14,

    outline: state.menuIsOpen ? '2px solid #007BFF' : 'unset',
    outlineOffset: 3,
    cursor: 'pointer',
    '&:hover': {
      border: '1px solid #ddd',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#e6f7ff'
      : state.isFocused
      ? 'transparent'
      : '#fff',
    color: '#333',
    cursor: 'pointer',
    padding: '10px',
    ':active': {
      // backgroundColor: '#007bff8e',
      // color: 'white',
    },
    ':hover': {
      backgroundColor: '#e6f7ff',
    },
    fontSize: 14,
    margin: '5px',
    borderRadius: 8,
    width: 'unset',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: 14,
  }),
}

// Custom theme to override default colors and border radius.
const customTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary25: '#e6f7ff',
    primary: '#007BFF',
  },
})

interface SelectProps extends ReactSelectProps {}
export const SelectField = (props: SelectProps) => {
  return (
    <Select
      // options={customOptions}
      options={props.options}
      styles={customReactSelectStyles}
      theme={customTheme}
      placeholder={props.placeholder}
      {...props}
    />
  )
}

interface AsyncSelectProps
  extends AsyncProps<unknown, false, GroupBase<unknown>> {
  styles?: StylesConfig
  menuListHeight?: number
}

export const AsyncSelectField = (props: AsyncSelectProps) => {
  return (
    <AsyncSelect
      styles={{ ...customReactSelectStyles, ...props?.styles }}
      theme={customTheme}
      // placeholder={props}
      placeholder={props.placeholder}
      {...props}
    />
  )
}
