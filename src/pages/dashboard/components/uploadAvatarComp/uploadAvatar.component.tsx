import { Box, Typography } from '@mui/material'
import {
  ProfilePicCircle,
  ProfilePicContainer,
  ProfilePicInnerCircle,
  ProfilePicInnerCircleImage,
  ProfilePicInput,
  ProfilePicSelectBtn,
} from './uploadAvatar.styles'
import { IoCameraOutline } from 'react-icons/io5'
import { colors } from '@src/helpers/colors.helpers'
import { isEmpty } from 'lodash'
import React from 'react'

interface Props {
  onImageSelect: (file: File) => void
}
export function UploadAvatarComp(props: Props) {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null)
  const randomString = Math.random().toString(36).substring(7)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      props.onImageSelect(file)
      const reader = new FileReader()

      // When the file is read, set the image source to the Data URL
      reader.onload = function (e) {
        const imageUrl = e.target?.result
        if (!isEmpty(imageUrl) && imageUrl) {
          setImgUrl(imageUrl as string)
        }
      }

      // Read the file as a Data URL (base64)
      reader.readAsDataURL(file)
    }
  }

  return (
    <Box>
      <ProfilePicContainer>
        <ProfilePicCircle>
          {isEmpty(imgUrl) ? (
            <ProfilePicInnerCircle>
              <IoCameraOutline size={24} color={colors.grey[600]} />
            </ProfilePicInnerCircle>
          ) : (
            <ProfilePicInnerCircleImage
              src={imgUrl as string}
            ></ProfilePicInnerCircleImage>
          )}
        </ProfilePicCircle>
        <Box>
          <Typography variant="body1" fontWeight={500}>
            Avatar
          </Typography>
          <Typography sx={{ display: 'block', mb: 2 }} variant="caption">
            Min 400 X 400px, PNG OR JPEG
          </Typography>
          <ProfilePicInput
            id={`profile-${randomString}`}
            type="file"
            multiple={false}
            accept="image/png, image/jpeg"
            onChange={handleChange}
          />
          <label htmlFor={`profile-${randomString}`}>
            {/* <ButtonComp color="secondary">Select</ButtonComp> */}
            {/* <button type="button">Select</button>
             */}
            <ProfilePicSelectBtn>Select</ProfilePicSelectBtn>
          </label>
        </Box>
      </ProfilePicContainer>
    </Box>
  )
}
