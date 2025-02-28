import { ButtonComp } from '@src/components/button/button.component'
import { useNavigate } from 'react-router-dom'

export function Homepage() {
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  // const open = Boolean(anchorEl)
  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget)
  // }
  // const handleClose = () => {
  //   setAnchorEl(null)
  // }
  const navigate = useNavigate()

  return (
    <div>
      <ButtonComp
        onClick={() => {
          navigate('/login')
        }}
      >
        Login
      </ButtonComp>
    </div>
  )
}
