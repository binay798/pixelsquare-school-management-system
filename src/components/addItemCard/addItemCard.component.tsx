import { Box, Stack, Typography } from '@mui/material'
import { AddItemStyledCard } from './addItemCard.styles'
import { IoAddOutline } from 'react-icons/io5'

interface Props {
  title: string
  onClick: () => void
}
export function AddItemCard(props: Props) {
  return (
    <Box>
      <AddItemStyledCard onClick={props.onClick}>
        <Stack
          direction={'column'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <IoAddOutline size={30} />
          <Typography fontWeight={'bold'} variant="body1">
            {props.title}
          </Typography>
        </Stack>
      </AddItemStyledCard>
    </Box>
  )
}
