import { Box, Stack, Typography } from '@mui/material'
import SpringModal from '../modal/modal.component'
import { ConfirmationContainer, InfoImage } from './confirmationModal.styles'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '../button/button.component'
import React from 'react'

interface Props {
  open: boolean
  children: React.ReactElement
  onClose: () => void
  heading?: React.ReactNode
  onConfirmationClick: () => void
  confirmLoader?: boolean
  confirmText?: string
  cancelText?: string
}

export function DeleteConfirmationModal({
  heading = 'Are you sure want to delete ?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  ...props
}: Props) {
  return (
    <SpringModal close={props.onClose} open={props.open} size="xs">
      <ConfirmationContainer>
        {/* <Box p={2} borderBottom={`1px solid ${colors.grey[300]}`}> */}
        <Box pb={0} mb={1}>
          <Stack
            direction="column"
            alignItems={'center'}
            spacing={2}
            color={colors.red[600]}
          >
            {/* <RiErrorWarningLine size={90} /> */}
            <InfoImage src="/icons/delete.png" alt="Info" />
            <Typography
              variant="body1"
              color="textPrimary"
              fontWeight={500}
              fontSize={18}
              textAlign={'center'}
            >
              {heading}
            </Typography>
          </Stack>
        </Box>
        <Box maxHeight={'90vh'} mb={6} textAlign={'center'} overflow={'auto'}>
          {props.children}
        </Box>
        <Box mt={2}>
          <Stack
            direction={'row'}
            sx={{ width: '70%', margin: '0 auto' }}
            spacing={1}
            justifyContent={'center'}
          >
            <ButtonComp
              onClick={props.onClose}
              variant="outlined"
              color="error"
              size="medium"
              sx={{ flex: 1 }}
            >
              {cancelText}
            </ButtonComp>
            <ButtonComp
              loading={props.confirmLoader}
              onClick={props.onConfirmationClick}
              size="medium"
              sx={{ flex: 1 }}
              color="error"
            >
              {confirmText}
            </ButtonComp>
          </Stack>
        </Box>
      </ConfirmationContainer>
    </SpringModal>
  )
}
