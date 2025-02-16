import { Typography } from '@mui/material'
import {
  FullPageLoaderContainer,
  LoaderContainer,
  LoaderMain,
} from './loader.styles'
// import { colors } from '@src/helpers/colors.helpers'
import ReactDOM from 'react-dom'

export function Loader() {
  return (
    <LoaderContainer>
      <LoaderMain />
      <Typography color={'#0f0b26'} variant="caption" style={{ marginLeft: 8 }}>
        Please wait...
      </Typography>
    </LoaderContainer>
  )
}

export function FullPageLoader() {
  return ReactDOM.createPortal(
    <FullPageLoaderContainer>
      <Loader />
    </FullPageLoaderContainer>,
    // @ts-ignore
    document.getElementById('fullpage-loader')
  )
}
