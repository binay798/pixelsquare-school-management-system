import styled from '@emotion/styled'

export const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
`
export const ToastItemContainer = styled.div`
  min-width: 150px;
  border: 1px solid #ccc;
  padding: 10px 5px 10px 10px;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  border-radius: 8px;
  min-height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ToastTypeImage = styled.img`
  display: block;
  width: 20px;
  height: 20px;
`
