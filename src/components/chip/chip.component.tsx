import { Chip } from '@mui/material'
import { IoIosCloseCircle } from 'react-icons/io'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  label: string
  type: 'success' | 'error'
}
export function CustomChip(props: Props) {
  return (
    <Chip
      size="small"
      icon={
        props.type === 'success' ? (
          <IoIosCheckmarkCircle color="white" />
        ) : (
          <IoIosCloseCircle color="white" />
        )
      }
      label={props.label}
      sx={{
        background:
          props.type === 'success' ? colors.green[500] : colors.red[400],
        color: 'white',
        fontWeight: 500,
      }}
    />
  )
}
