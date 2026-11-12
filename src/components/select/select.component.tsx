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

export interface AsyncSelectFieldProps<Option, IsMulti extends boolean = false>
  extends Omit<AsyncProps<Option, IsMulti, GroupBase<Option>>, 'styles'> {
  // Kept deliberately untyped so the many existing call sites can pass their
  // shared style objects without re-declaring the generic option type.
  styles?: StylesConfig
  menuListHeight?: number
}

/**
 * Typed wrapper around react-select's async select.
 *
 * The component stays generic so callers can use it for both single and multi
 * select without casting. `AsyncProps` itself is generic, a non generic wrapper
 * forces every caller into a single select.
 */
export const AsyncSelectField = <Option, IsMulti extends boolean = false>(
  props: AsyncSelectFieldProps<Option, IsMulti>
) => {
  return (
    <AsyncSelect<Option, IsMulti>
      {...props}
      styles={
        {
          ...customReactSelectStyles,
          ...props.styles,
        } as unknown as StylesConfig<Option, IsMulti, GroupBase<Option>>
      }
      theme={customTheme}
      // placeholder={props}
      placeholder={props.placeholder}
    />
  )
}
