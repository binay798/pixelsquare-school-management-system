import { Box, Stack, Typography } from '@mui/material'
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
import React, { useEffect, useState } from 'react'
import { IoIosCamera } from 'react-icons/io'
import { IoSave } from 'react-icons/io5'
import { ButtonComp } from '@src/components/button/button.component'

interface Props {
  onImageSelect: (file: File) => void
  editMode?: {
    imgUrl?: string
    onSave?: (onClose?: () => void) => void
    saveBtnLoading?: boolean
  }
}
export function UploadAvatarComp(props: Props) {
  const [showSaveBtn, setShowSaveBtn] = useState(false)
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
      if (props?.editMode) {
        setShowSaveBtn(true)
      }
    }
  }

  useEffect(() => {
    if (!isEmpty(props?.editMode?.imgUrl)) {
      setImgUrl(props?.editMode?.imgUrl as string)
    }
  }, [props?.editMode?.imgUrl])

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
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <label htmlFor={`profile-${randomString}`}>
              {/* <ButtonComp color="secondary">Select</ButtonComp> */}
              {/* <button type="button">Select</button>
               */}
              <ProfilePicSelectBtn>
                <IoIosCamera size={20} />
                <span>
                  {!isEmpty(props?.editMode) ? 'Change Photo' : 'Choose Photo'}
                </span>
              </ProfilePicSelectBtn>
            </label>
            {showSaveBtn ? (
              <ButtonComp
                onClick={() =>
                  props?.editMode?.onSave?.(() => {
                    setShowSaveBtn(false)
                  })
                }
                startIcon={<IoSave />}
                color="success"
                loading={props?.editMode?.saveBtnLoading}
              >
                Save
              </ButtonComp>
            ) : null}
          </Stack>
        </Box>
      </ProfilePicContainer>
    </Box>
  )
}
