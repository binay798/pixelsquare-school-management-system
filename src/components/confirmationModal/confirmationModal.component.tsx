import { Box, Stack, Typography } from '@mui/material'
import SpringModal from '../modal/modal.component'
import { ConfirmationContainer } from './confirmationModal.styles'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '../button/button.component'

interface Props {
  open: boolean
  children: React.ReactNode
  onClose: () => void
  heading?: string
  onConfirmationClick: () => void
  confirmLoader?: boolean
}

export function ConfirmationModal({
  heading = 'Are you sure want to proceed ?',
  ...props
}: Props) {
  return (
    <SpringModal noPadding close={props.onClose} open={props.open} size="sm">
      <ConfirmationContainer>
        <Box p={2} borderBottom={`1px solid ${colors.grey[300]}`}>
          <Typography
            variant="body1"
            color="textPrimary"
            fontWeight={500}
            fontSize={18}
          >
            {heading}
          </Typography>
        </Box>
        <Box p={2} maxHeight={'90vh'} overflow={'auto'}>
          {props.children}
        </Box>
        <Box p={2} mt={2}>
          <Stack direction={'row'} spacing={1} justifyContent={'flex-end'}>
            <ButtonComp
              onClick={props.onClose}
              variant="text"
              color="secondary"
              size="medium"
            >
              Cancel
            </ButtonComp>
            <ButtonComp
              loading={props.confirmLoader}
              onClick={props.onConfirmationClick}
              size="medium"
            >
              Confirm
            </ButtonComp>
          </Stack>
        </Box>
      </ConfirmationContainer>
    </SpringModal>
  )
}
