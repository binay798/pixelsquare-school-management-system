import styled from '@emotion/styled'
import { animated } from '@react-spring/web'
import { scrollbarStyle } from '@src/helpers/scrollbarStyle.helpers'

export const Container = styled.div``

export const AnimatedBox = styled(animated.div)`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
  min-width: 150px;
  ${scrollbarStyle()}
`
export const BackdropContainer = styled.div`
  background: #2e2d2d8c;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

export const CloseContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`
