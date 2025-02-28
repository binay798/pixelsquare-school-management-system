import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

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

  useEffect(() => {
    navigate('/login')
  })

  return <div></div>
}
