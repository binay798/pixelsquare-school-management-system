import styled from '@emotion/styled'
import { animated } from '@react-spring/web'

export const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
`
export const ToastItemContainer = styled(animated.div)`
  min-width: 150px;
  border: 1px solid #ccc;
  padding: 10px 20px;
`
