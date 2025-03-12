import styled from '@emotion/styled'
import { colors } from '@src/helpers/colors.helpers'

export const ProfilePicContainer = styled('div')`
  display: flex;
  margin: 2rem 0rem;
  align-items: center;
  gap: 2rem;
`
export const ProfilePicCircle = styled('div')`
  border: 1px dashed ${colors.grey[300]};
  width: 8rem;
  height: 8rem;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ProfilePicInnerCircle = styled('div')`
  width: 7rem;
  height: 7rem;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.grey[50]};
`
export const ProfilePicInnerCircleImage = styled('img')`
  width: 7rem;
  height: 7rem;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
`
export const ProfilePicInput = styled('input')`
  display: none;
`
export const ProfilePicSelectBtn = styled('span')`
  display: flex;
  width: max-content;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  background-image: linear-gradient(to bottom, #333 30%, #222 90%);
  cursor: pointer;
  color: white;
  border-radius: 0.5rem;
  font-size: 14px;

  &:hover {
    background-image: linear-gradient(to bottom, #222 30%, #111 90%);
  }
`
