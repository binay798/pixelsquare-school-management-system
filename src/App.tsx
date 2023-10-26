import './App.css'
import { AuthRouter } from '@src/hooks/authRouter.hooks'
import './helpers/api.helpers'

// TODO: Need to add ThemeProvider responsiveFontSizes(theme)
function App() {
  return (
    <AuthRouter auth={{ user: {}, token: 'fdf' }} loading={false}></AuthRouter>
  )
}

export default App
