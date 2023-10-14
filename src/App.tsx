import './App.css'
import { AuthRouter } from '@src/hooks/authRouter.hooks'

function App() {
  return (
    <AuthRouter auth={{ user: {}, token: 'fdf' }} loading={false}></AuthRouter>
  )
}

export default App
