import Select, {
  StylesConfig,
  ThemeConfig,
  Props as ReactSelectProps,
} from 'react-select'

// Custom styles for the react-select component.
const customStyles: StylesConfig = {
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
      styles={customStyles}
      theme={customTheme}
      placeholder={props.placeholder}
      {...props}
    />
  )
}
