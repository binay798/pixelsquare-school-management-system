import styled from '@emotion/styled'
import { colors } from '@src/helpers/colors.helpers'

export const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
`
export const LoaderMain = styled.div`
  width: 48px;
  height: 48px;
  border: 3px dotted #0f0b26;
  border-style: solid solid dotted dotted;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 2s linear infinite;

  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border: 3px dotted #0f0b26;
    border-style: solid solid dotted;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    animation: rotationBack 1s linear infinite;
    transform-origin: center center;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes rotationBack {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }
`

export const FullPageLoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.grey[100]};
  position: fixed;
  z-index: 200;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
`
