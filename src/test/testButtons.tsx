import { Box, Stack } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'

export function TestButtonComponents() {
  return (
    <Box>
      <Stack spacing={2} m={2} direction={'row'} alignItems={'center'}>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="contained" size="large" color="primary">
            Primary
          </ButtonComp>
          <ButtonComp disableElevation size="large" color="secondary">
            Secondary
          </ButtonComp>
          <ButtonComp color="error" size="large">
            Error
          </ButtonComp>
          <ButtonComp color="info" size="large">
            Info
          </ButtonComp>
          <ButtonComp variant="contained" size="large" color="success">
            Success
          </ButtonComp>
          <ButtonComp size="large" color="warning">
            Warning
          </ButtonComp>
        </Stack>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="text" size="large" color="primary">
            Primary
          </ButtonComp>
        </Stack>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="outlined" size="large" color="primary">
            Primary
          </ButtonComp>
          <ButtonComp
            variant="outlined"
            disableElevation
            size="large"
            color="secondary"
          >
            Secondary
          </ButtonComp>
          <ButtonComp variant="outlined" color="error" size="large">
            Error
          </ButtonComp>
          <ButtonComp variant="outlined" color="info" size="large">
            Info
          </ButtonComp>
          <ButtonComp variant="outlined" size="large" color="success">
            Success
          </ButtonComp>
          <ButtonComp variant="outlined" size="large" color="warning">
            Warning
          </ButtonComp>
        </Stack>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="contained" size="large" color="primary" loading>
            Primary
          </ButtonComp>
          <ButtonComp disableElevation size="large" color="secondary" loading>
            Secondary
          </ButtonComp>
          <ButtonComp color="error" size="large" loading>
            Error
          </ButtonComp>
          <ButtonComp color="info" size="large" loading>
            Info
          </ButtonComp>
          <ButtonComp variant="contained" size="large" color="success" loading>
            Success
          </ButtonComp>
          <ButtonComp size="large" color="warning" loading>
            Warning
          </ButtonComp>
        </Stack>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="contained" size="medium" color="primary">
            Primary
          </ButtonComp>
          <ButtonComp disableElevation size="medium" color="secondary">
            Secondary
          </ButtonComp>
          <ButtonComp color="error" size="medium">
            Error
          </ButtonComp>
          <ButtonComp color="info" size="medium">
            Info
          </ButtonComp>
          <ButtonComp variant="contained" size="medium" color="success">
            Success
          </ButtonComp>
          <ButtonComp size="medium" color="warning">
            Warning
          </ButtonComp>
        </Stack>
        <Stack direction={'column'} gap={2}>
          <ButtonComp variant="contained" size="small" color="primary">
            Primary
          </ButtonComp>
          <ButtonComp disableElevation size="small" color="secondary">
            Secondary
          </ButtonComp>
          <ButtonComp color="error" size="small">
            Error
          </ButtonComp>
          <ButtonComp color="info" size="small">
            Info
          </ButtonComp>
          <ButtonComp variant="contained" size="small" color="success">
            Success
          </ButtonComp>
          <ButtonComp size="small" color="warning">
            Warning
          </ButtonComp>
        </Stack>
      </Stack>
    </Box>
  )
}
