import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import SpringModal from '@src/components/modal/modal.component'

interface Props {
  open: boolean
  onClose: () => void
}
export function CreateDesignationModal(props: Props) {
  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Create Designation
        </Typography>
        <br />
        <form>
          <InputField
            type="text"
            placeholder="Librarian"
            labelDetail={{ required: true, text: 'Designation' }}
          />
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            <ButtonComp size="medium">Create</ButtonComp>
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
