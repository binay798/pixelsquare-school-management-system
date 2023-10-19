import { IconButtonProps } from '@mui/material'
import { IconBtn } from './button.styles'
import { AiOutlineClose } from 'react-icons/ai'

export function CloseBtn({ ...rest }: IconButtonProps) {
  return (
    <IconBtn {...rest} disableFocusRipple disableTouchRipple size={'small'}>
      <AiOutlineClose size={16} />
    </IconBtn>
  )
}
