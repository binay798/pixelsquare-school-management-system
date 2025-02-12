import Select, {
  StylesConfig,
  ThemeConfig,
  Props as ReactSelectProps,
} from 'react-select'

// Custom styles for the react-select component.
const customStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? '1px solid #007BFF' : '1px solid #ddd',
    boxShadow: state.isFocused ? '0 0 0 1px #007BFF' : 'none',
    transition: 'all 0.2s ease',
    fontSize: 14,
    '&:hover': {
      border: state.isFocused ? '1px solid #007BFF' : '1px solid #ccc',
    },
    cursor: 'pointer',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#007BFF'
      : state.isFocused
      ? '#e6f7ff'
      : '#fff',
    color: state.isSelected ? '#fff' : '#333',
    cursor: 'pointer',
    padding: '10px',
    ':active': {
      backgroundColor: '#007BFF',
      color: 'white',
    },
    fontSize: 14,
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

// function App() {
//   return (
//     <div style={{ width: '300px', margin: '100px auto' }}>
//       <Select
//         options={customOptions}
//         styles={customStyles}
//         theme={customTheme}
//         components={{ Option: CustomOption }} // Override the default Option component.
//         placeholder="Select a fruit..."
//       />
//     </div>
//   )
// }

// export default App
