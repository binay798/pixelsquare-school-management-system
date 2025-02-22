import { Box, Divider, Typography } from '@mui/material'

interface Props {
  children: React.ReactElement
  title: string
}
export function FormBlock(props: Props) {
  return (
    <Box mb={4}>
      <Typography mb={2} variant="body1" fontWeight={500}>
        {props.title}
      </Typography>
      <Box mb={4}>{props.children}</Box>
      <Divider />
    </Box>
  )
}
